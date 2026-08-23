package com.vetmonk.service;

import com.vetmonk.dto.InventoryDto;
import com.vetmonk.entity.Medicine;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.repository.MedicineRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryDto.MedicineResponse> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<InventoryDto.MedicineResponse> searchMedicines(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return medicineRepository.findAll(pageable).map(this::mapToResponse);
        }
        return medicineRepository.findByNameContainingIgnoreCaseOrGenericNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                query, query, query, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public InventoryDto.MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        return mapToResponse(medicine);
    }

    @Transactional
    public InventoryDto.MedicineResponse createMedicine(InventoryDto.MedicineRequest request) {
        if (medicineRepository.findByNameIgnoreCase(request.getName().trim()).isPresent()) {
            throw new BadRequestException("A medicine with this name already exists in the catalog.");
        }

        Medicine medicine = new Medicine(
                request.getName().trim(),
                request.getGenericName(),
                request.getCategory(),
                request.getDosageForm(),
                request.getDescription(),
                request.getManufacturer()
        );

        Medicine saved = medicineRepository.save(medicine);
        return mapToResponse(saved);
    }

    public InventoryDto.MedicineResponse mapToResponse(Medicine m) {
        InventoryDto.MedicineResponse resp = new InventoryDto.MedicineResponse();
        resp.setId(m.getId());
        resp.setName(m.getName());
        resp.setGenericName(m.getGenericName());
        resp.setCategory(m.getCategory());
        resp.setDosageForm(m.getDosageForm());
        resp.setDescription(m.getDescription());
        resp.setManufacturer(m.getManufacturer());
        return resp;
    }
}
