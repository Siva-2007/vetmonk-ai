package com.vetmonk;

import com.vetmonk.dto.InventoryDto;
import com.vetmonk.entity.Clinic;
import com.vetmonk.entity.InventoryItem;
import com.vetmonk.entity.Medicine;
import com.vetmonk.entity.Role;
import com.vetmonk.entity.User;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.repository.ClinicRepository;
import com.vetmonk.repository.InventoryItemRepository;
import com.vetmonk.repository.MedicineRepository;
import com.vetmonk.security.UserPrincipal;
import com.vetmonk.service.AuditService;
import com.vetmonk.service.InventoryService;
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
public class InventoryServiceTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @Mock
    private ClinicRepository clinicRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private InventoryService inventoryService;

    private User clinicAdmin;
    private Clinic clinic;
    private Medicine medicine;
    private InventoryItem item;

    @BeforeEach
    void setUp() {
        clinicAdmin = new User("Marcus", "admin@clinic.com", "pass", Role.CLINIC_ADMIN, "123");
        clinicAdmin.setId(1L);

        clinic = new Clinic("Apex Vet", "123 Street", "555-1234", "apex@vet.com", "8am-8pm", "Care");
        clinic.setId(10L);

        medicine = new Medicine("Amoxicillin", "Clavamox", "Antibiotic", "Tablet", "Broad-spectrum", "Zoetis");
        medicine.setId(100L);

        item = new InventoryItem(clinic, medicine, "BAT-01", 50, "Tablets", 10, 1.5, LocalDate.now().plusMonths(6), "Supplier", LocalDate.now());
        item.setId(500L);

        UserPrincipal principal = UserPrincipal.create(clinicAdmin);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLINIC_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Successfully deducts stock when quantity is sufficient")
    void testStockDeductionSuccess() {
        when(inventoryItemRepository.findById(500L)).thenReturn(Optional.of(item));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InventoryDto.StockAdjustmentRequest req = new InventoryDto.StockAdjustmentRequest();
        req.setDelta(-20); // Dispense 20 tablets
        req.setReason("Prescription dispensing");

        InventoryDto.InventoryItemResponse response = inventoryService.adjustStock(500L, req);

        assertNotNull(response);
        assertEquals(30, response.getQuantity());
    }

    @Test
    @DisplayName("Prevents negative inventory adjustment")
    void testPreventNegativeStock() {
        when(inventoryItemRepository.findById(500L)).thenReturn(Optional.of(item));

        InventoryDto.StockAdjustmentRequest req = new InventoryDto.StockAdjustmentRequest();
        req.setDelta(-60); // Attempt to deduct 60 from current 50
        req.setReason("Excessive deduction");

        assertThrows(BadRequestException.class, () -> inventoryService.adjustStock(500L, req));
        assertEquals(50, item.getQuantity()); // Unchanged
    }
}
