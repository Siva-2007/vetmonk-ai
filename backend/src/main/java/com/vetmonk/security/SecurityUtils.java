package com.vetmonk.security;

import com.vetmonk.entity.Role;
import com.vetmonk.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (UserPrincipal) authentication.getPrincipal();
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public static String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    public static Role getCurrentUserRole() {
        return getCurrentUser().getRole();
    }

    public static boolean isSuperAdmin() {
        return getCurrentUser().getRole() == Role.SUPER_ADMIN;
    }

    public static boolean isClinicAdmin() {
        return getCurrentUser().getRole() == Role.CLINIC_ADMIN;
    }

    public static boolean isVeterinarian() {
        return getCurrentUser().getRole() == Role.VETERINARIAN;
    }

    public static boolean isReceptionist() {
        return getCurrentUser().getRole() == Role.RECEPTIONIST;
    }

    public static boolean isPetOwner() {
        return getCurrentUser().getRole() == Role.PET_OWNER;
    }

    public static boolean isStaffMember() {
        Role role = getCurrentUser().getRole();
        return role == Role.SUPER_ADMIN || role == Role.CLINIC_ADMIN || role == Role.VETERINARIAN || role == Role.RECEPTIONIST;
    }
}
