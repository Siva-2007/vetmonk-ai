package com.vetmonk;

import com.vetmonk.dto.AppointmentDto;
import com.vetmonk.entity.*;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.repository.AppointmentRepository;
import com.vetmonk.repository.ClinicRepository;
import com.vetmonk.repository.PetRepository;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.UserPrincipal;
import com.vetmonk.service.AppointmentService;
import com.vetmonk.service.AuditService;
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
import java.time.LocalTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private ClinicRepository clinicRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AppointmentService appointmentService;

    private User owner;
    private User vet;
    private Clinic clinic;
    private Pet pet;

    @BeforeEach
    void setUp() {
        owner = new User("Alex", "alex@test.com", "pass", Role.PET_OWNER, "123");
        owner.setId(1L);

        vet = new User("Dr. Sarah", "sarah@test.com", "pass", Role.VETERINARIAN, "456");
        vet.setId(2L);

        clinic = new Clinic("Apex Vet", "123 Street", "555-1234", "apex@vet.com", "8am-8pm", "Care");
        clinic.setId(10L);

        pet = new Pet("Max", "Dog", "Golden", LocalDate.now().minusYears(3), "Male", 25.0, owner);
        pet.setId(100L);

        UserPrincipal principal = UserPrincipal.create(owner);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_PET_OWNER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Prevents double booking for the same veterinarian and exact time slot")
    void testDoubleBookingPrevention() {
        AppointmentDto.BookAppointmentRequest req = new AppointmentDto.BookAppointmentRequest();
        req.setPetId(100L);
        req.setClinicId(10L);
        req.setVeterinarianId(2L);
        req.setAppointmentDate(LocalDate.now().plusDays(1));
        req.setAppointmentTime(LocalTime.of(10, 0));
        req.setReason("Checkup");

        when(petRepository.findById(100L)).thenReturn(Optional.of(pet));
        when(clinicRepository.findById(10L)).thenReturn(Optional.of(clinic));
        when(userRepository.findById(2L)).thenReturn(Optional.of(vet));

        // Simulate that this vet is already booked at this time
        when(appointmentRepository.existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                eq(2L), eq(req.getAppointmentDate()), eq(req.getAppointmentTime()), eq(AppointmentStatus.CANCELLED)
        )).thenReturn(true);

        assertThrows(BadRequestException.class, () -> appointmentService.bookAppointment(req));
    }

    @Test
    @DisplayName("Successfully books appointment when slot is open")
    void testSuccessfulAppointmentBooking() {
        AppointmentDto.BookAppointmentRequest req = new AppointmentDto.BookAppointmentRequest();
        req.setPetId(100L);
        req.setClinicId(10L);
        req.setVeterinarianId(2L);
        req.setAppointmentDate(LocalDate.now().plusDays(1));
        req.setAppointmentTime(LocalTime.of(11, 0));
        req.setReason("Routine vaccination");

        when(petRepository.findById(100L)).thenReturn(Optional.of(pet));
        when(clinicRepository.findById(10L)).thenReturn(Optional.of(clinic));
        when(userRepository.findById(2L)).thenReturn(Optional.of(vet));
        when(appointmentRepository.existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusNot(any(), any(), any(), any()))
                .thenReturn(false);

        Appointment saved = new Appointment(pet, owner, clinic, vet, req.getAppointmentDate(), req.getAppointmentTime(), req.getReason());
        saved.setId(500L);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(saved);

        AppointmentDto.AppointmentResponse response = appointmentService.bookAppointment(req);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals(AppointmentStatus.REQUESTED, response.getStatus());
    }
}
