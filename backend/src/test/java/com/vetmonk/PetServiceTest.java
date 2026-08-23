package com.vetmonk;

import com.vetmonk.dto.PetDto;
import com.vetmonk.entity.Pet;
import com.vetmonk.entity.Role;
import com.vetmonk.entity.User;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.PetRepository;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.UserPrincipal;
import com.vetmonk.service.AuditService;
import com.vetmonk.service.PetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PetServiceTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private PetService petService;

    private User owner1;
    private User owner2;
    private Pet pet1;

    @BeforeEach
    void setUp() {
        owner1 = new User("Owner One", "owner1@test.com", "pass", Role.PET_OWNER, "123");
        owner1.setId(1L);

        owner2 = new User("Owner Two", "owner2@test.com", "pass", Role.PET_OWNER, "456");
        owner2.setId(2L);

        pet1 = new Pet("Buddy", "Dog", "Beagle", LocalDate.now().minusYears(2), "Male", 12.0, owner1);
        pet1.setId(100L);
    }

    private void mockSecurityContext(User user) {
        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Pet owner can view their own pet")
    void testOwnerCanViewOwnPet() {
        mockSecurityContext(owner1);
        when(petRepository.findById(100L)).thenReturn(Optional.of(pet1));

        PetDto.PetResponse response = petService.getPetById(100L);

        assertNotNull(response);
        assertEquals("Buddy", response.getName());
        assertEquals(1L, response.getOwnerId());
    }

    @Test
    @DisplayName("Pet owner cannot view another owner's pet (IDOR prevention)")
    void testOwnerCannotViewOtherPet() {
        mockSecurityContext(owner2); // Authenticated as owner2
        when(petRepository.findById(100L)).thenReturn(Optional.of(pet1)); // Pet belongs to owner1

        assertThrows(SecurityViolationException.class, () -> petService.getPetById(100L));
    }

    @Test
    @DisplayName("Staff member (Veterinarian) is authorized to view pet")
    void testVetCanViewPet() {
        User vet = new User("Dr. Vet", "vet@test.com", "pass", Role.VETERINARIAN, "789");
        vet.setId(50L);
        mockSecurityContext(vet);

        when(petRepository.findById(100L)).thenReturn(Optional.of(pet1));

        PetDto.PetResponse response = petService.getPetById(100L);
        assertNotNull(response);
        assertEquals("Buddy", response.getName());
    }
}
