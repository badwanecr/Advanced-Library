package com.libassist.library.service;

import com.libassist.library.dto.EbookAccessDto;
import com.libassist.library.dto.SubscriptionDto;
import com.libassist.library.entity.Subscription;
import com.libassist.library.entity.User;
import com.libassist.library.exception.BadRequestException;
import com.libassist.library.exception.NotFoundException;
import com.libassist.library.repository.SubscriptionRepository;
import com.libassist.library.repository.UserRepository;
import com.libassist.library.security.AccessGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    public static final String MONTHLY = "monthly";
    public static final String YEARLY = "yearly";

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final AccessGuard accessGuard;

    @Value("${app.subscription.monthly-price}")
    private Double monthlyPrice;

    @Value("${app.subscription.yearly-price}")
    private Double yearlyPrice;

    /** The patron's live subscription, or empty. Staff never hold one. */
    public Optional<Subscription> activeSubscription(Long userId) {
        return subscriptionRepository
                .findFirstByUserIdAndStatusAndEndDateAfterOrderByEndDateDesc(userId, "active", LocalDateTime.now());
    }

    public boolean isStaff(User user) {
        return accessGuard.isStaff(user);
    }

    @Transactional
    public SubscriptionDto subscribe(Long userId, String plan) {
        if (!MONTHLY.equals(plan) && !YEARLY.equals(plan)) {
            throw new BadRequestException("Plan must be either monthly or yearly");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User does not exist"));
        if (isStaff(user)) {
            throw new BadRequestException("Librarians and admins already read every ebook, no subscription needed");
        }

        LocalDateTime now = LocalDateTime.now();
        Optional<Subscription> current = activeSubscription(userId);
        double credit = 0.0;

        if (current.isPresent()) {
            Subscription running = current.get();
            if (YEARLY.equals(running.getPlan())) {
                throw new BadRequestException("You are already on the yearly plan until "
                        + running.getEndDate().toLocalDate());
            }
            if (MONTHLY.equals(plan)) {
                throw new BadRequestException("Your monthly plan is active until "
                        + running.getEndDate().toLocalDate() + ". Upgrade to yearly instead.");
            }
            // monthly -> yearly: credit the part of the month they have not used yet
            credit = unusedValue(running, now);
            running.setStatus("upgraded");
            running.setEndDate(now);
            subscriptionRepository.save(running);
        }

        double listPrice = YEARLY.equals(plan) ? yearlyPrice : monthlyPrice;
        double payable = round2(Math.max(0, listPrice - credit));

        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(plan)
                .startDate(now)
                .endDate(YEARLY.equals(plan) ? now.plusYears(1) : now.plusMonths(1))
                .amount(payable)
                .creditApplied(round2(credit))
                .status("active")
                .build();

        return toDto(subscriptionRepository.save(subscription));
    }

    /**
     * Value the patron has paid for but not yet consumed, pro-rated by the second so an
     * upgrade never charges twice for the same days.
     */
    public double unusedValue(Subscription subscription, LocalDateTime now) {
        long total = Duration.between(subscription.getStartDate(), subscription.getEndDate()).getSeconds();
        long remaining = Duration.between(now, subscription.getEndDate()).getSeconds();
        if (total <= 0 || remaining <= 0) {
            return 0.0;
        }
        double paid = subscription.getAmount() == null ? 0.0 : subscription.getAmount();
        return round2(paid * ((double) remaining / total));
    }

    public EbookAccessDto accessSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User does not exist"));

        EbookAccessDto.EbookAccessDtoBuilder builder = EbookAccessDto.builder()
                .role(user.getRole())
                .monthlyPrice(monthlyPrice)
                .yearlyPrice(yearlyPrice);

        if (isStaff(user)) {
            return builder.unlimitedByRole(true).action("none").build();
        }

        Optional<Subscription> current = activeSubscription(userId);
        if (current.isEmpty()) {
            return builder.unlimitedByRole(false).action("subscribe").build();
        }

        Subscription running = current.get();
        builder.unlimitedByRole(false).subscription(toDto(running));

        if (YEARLY.equals(running.getPlan())) {
            // nothing above yearly to move up to
            return builder.action("none").build();
        }

        double credit = unusedValue(running, LocalDateTime.now());
        return builder.action("upgrade")
                .upgradeCredit(credit)
                .upgradePrice(round2(Math.max(0, yearlyPrice - credit)))
                .build();
    }

    public SubscriptionDto toDto(Subscription subscription) {
        return SubscriptionDto.builder()
                .id(subscription.getId())
                .plan(subscription.getPlan())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .amount(subscription.getAmount())
                .creditApplied(subscription.getCreditApplied())
                .status(subscription.getStatus())
                .build();
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
