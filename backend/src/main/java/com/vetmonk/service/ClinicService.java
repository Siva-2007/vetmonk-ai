package com.vetmonk.service;

import com.vetmonk.dto.ClinicDto;
import com.vetmonk.entity.Clinic;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.repository.ClinicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClinicService {

    private final ClinicRepository clinicRepository;

    public ClinicService(ClinicRepository clinicRepository) {
        this.clinicRepository = clinicRepository;
    }

    @Transactional(readOnly = true)
    public List<ClinicDto.ClinicResponse> getAllActiveClinics() {
        return clinicRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClinicDto.ClinicResponse> getAllClinics() {
        return clinicRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClinicDto.ClinicResponse getClinicById(Long id) {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinic", "id", id));
        return mapToResponse(clinic);
    }

    @Transactional
    public ClinicDto.ClinicResponse createClinic(ClinicDto.ClinicRequest request) {
        Clinic clinic = new Clinic(
                request.getName(),
                request.getAddress(),
                request.getPhone(),
                request.getEmail(),
                request.getOpeningHours() != null ? request.getOpeningHours() : "08:00 AM - 08:00 PM",
                request.getServices() != null ? request.getServices() : "General Checkup, Vaccinations, Surgery"
        );
        if (request.getStatus() != null) {
            clinic.setStatus(request.getStatus());
        }

        Clinic saved = clinicRepository.save(clinic);
        return mapToResponse(saved);
    }

    @Transactional
    public ClinicDto.ClinicResponse updateClinic(Long id, ClinicDto.ClinicRequest request) {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinic", "id", id));

        clinic.setName(request.getName());
        clinic.setAddress(request.getAddress());
        clinic.setPhone(request.getPhone());
        clinic.setEmail(request.getEmail());
        if (request.getOpeningHours() != null) clinic.setOpeningHours(request.getOpeningHours());
        if (request.getServices() != null) clinic.setServices(request.getServices());
        if (request.getStatus() != null) clinic.setStatus(request.getStatus());

        Clinic updated = clinicRepository.save(clinic);
        return mapToResponse(updated);
    }

    private ClinicDto.ClinicResponse mapToResponse(Clinic clinic) {
        return new ClinicDto.ClinicResponse(
                clinic.getId(),
                clinic.getName(),
                clinic.getAddress(),
                clinic.getPhone(),
                clinic.getEmail(),
                clinic.getOpeningHours(),
                clinic.getServices(),
                clinic.getStatus(),
                clinic.getCreatedAt()
        );
    }
}
