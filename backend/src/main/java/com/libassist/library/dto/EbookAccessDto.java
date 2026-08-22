package com.libassist.library.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** What the ebooks page needs to render its subscribe / upgrade / rent controls. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EbookAccessDto {

    private String role;

    /** staff read everything without subscribing */
    private boolean unlimitedByRole;

    private SubscriptionDto subscription;

    /** subscribe, upgrade or none - which button the patron should see */
    private String action;

    private Double monthlyPrice;
    private Double yearlyPrice;

    /** unused value of a running monthly plan, credited towards the yearly price */
    private Double upgradeCredit;

    /** yearly price minus upgradeCredit; what an upgrade would actually cost today */
    private Double upgradePrice;
}
