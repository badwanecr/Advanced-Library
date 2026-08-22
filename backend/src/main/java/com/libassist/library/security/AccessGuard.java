package com.libassist.library.security;

import com.libassist.library.entity.User;
import com.libassist.library.exception.BadRequestException;
import com.libassist.library.exception.NotFoundException;
import com.libassist.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Server-side role checks. The UI hides staff-only screens from patrons, but hiding a button is
 * not a control - anyone can call the API directly - so the rules are enforced here as well.
 * Roles are read from the database rather than the token, so a demotion takes effect immediately.
 */
@Component
@RequiredArgsConstructor
public class AccessGuard {

    private final UserRepository userRepository;

    public User currentUser() {
        Long id = CurrentUser.id();
        if (id == null) {
            throw new BadRequestException("Please login again");
        }
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User does not exist"));
    }

    public boolean isStaff(User user) {
        return "admin".equals(user.getRole()) || "librarian".equals(user.getRole());
    }

    /** @param action phrased to complete "Only librarians and admins can ..." */
    public User requireStaff(String action) {
        User user = currentUser();
        if (!isStaff(user)) {
            throw new BadRequestException("Only librarians and admins can " + action);
        }
        return user;
    }

    /** @param action phrased to complete "Only admins can ..." */
    public User requireAdmin(String action) {
        User user = currentUser();
        if (!"admin".equals(user.getRole())) {
            throw new BadRequestException("Only admins can " + action);
        }
        return user;
    }
}
