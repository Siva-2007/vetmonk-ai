package com.vetmonk.util;

import com.vetmonk.config.AppProperties;
import com.vetmonk.entity.*;
import com.vetmonk.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger =
            LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ClinicRepository clinicRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryItemRepository inventoryItemRepository;

    private final KnowledgeDocumentRepository knowledgeDocumentRepository;
    private final KnowledgeChunkRepository knowledgeChunkRepository;

    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    public DataInitializer(
            UserRepository userRepository,
            ClinicRepository clinicRepository,
            MedicineRepository medicineRepository,
            InventoryItemRepository inventoryItemRepository,
            KnowledgeDocumentRepository knowledgeDocumentRepository,
            KnowledgeChunkRepository knowledgeChunkRepository,
            PasswordEncoder passwordEncoder,
            AppProperties appProperties) {

        this.userRepository = userRepository;
        this.clinicRepository = clinicRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.knowledgeDocumentRepository = knowledgeDocumentRepository;
        this.knowledgeChunkRepository = knowledgeChunkRepository;
        this.passwordEncoder = passwordEncoder;
        this.appProperties = appProperties;
    }

    @Override
    @Transactional
    public void run(String... args) {

        /*
         * ============================================================
         * RAG KNOWLEDGE BASE
         * ============================================================
         *
         * This is application knowledge, not patient/demo data.
         */
        if (knowledgeDocumentRepository.count() == 0) {
            seedKnowledgeBase();
        }

        /*
         * ============================================================
         * DEMO ACCOUNTS + CLINIC CONFIGURATION
         * ============================================================
         *
         * We seed TWO hospitals.
         *
         * Hospital 1:
         *   - Clinic Admin
         *   - Veterinarian Sarah
         *   - Veterinarian Rajesh
         *   - Receptionist
         *
         * Hospital 2:
         *   - Clinic Admin
         *   - Veterinarian
         *   - Receptionist
         *
         * Public registration remains PET_OWNER only.
         *
         * No pets, appointments, queues, consultations,
         * medical records, vaccinations or vacancies are
         * created here.
         */

        if (userRepository.count() > 0 || !appProperties.isSeedDemoData()) {

            logger.info(
                    "Skipping demo account seeding. Existing users: {}",
                    userRepository.count()
            );

            return;
        }

        logger.info(
                "Creating demo accounts and TWO clinic configurations..."
        );


        // ============================================================
        // 1. HOSPITAL / CLINIC 1
        // ============================================================

        Clinic clinic1 = new Clinic(
                "Apex Care Veterinary Hospital & Specialty Center",
                "742 Evergreen Healthcare Blvd, Suite 100, Metro City",
                "+1 (555) 234-5678",
                "contact@apexvetcare.com",
                "08:00 AM - 08:00 PM",
                "General Medicine, Surgery, Vaccinations, Radiology, Dental, Emergency Critical Care"
        );

        Clinic savedClinic1 = clinicRepository.save(clinic1);


        // ============================================================
        // 2. HOSPITAL / CLINIC 2
        // ============================================================

        Clinic clinic2 = new Clinic(
                "Green Valley Veterinary Hospital",
                "125 Green Valley Medical Road, Metro City",
                "+1 (555) 345-6789",
                "contact@greenvalleyvet.com",
                "08:00 AM - 08:00 PM",
                "General Medicine, Surgery, Vaccinations, Dental, Emergency Care"
        );

        Clinic savedClinic2 = clinicRepository.save(clinic2);


        // ============================================================
        // 3. SUPER ADMIN
        // ============================================================
        //
        // Super Admin is a platform-level account.
        // It is assigned to clinic1 only for compatibility
        // with the existing User model.
        //
        // It must NOT be selected as a Hospital Staff role.
        // ============================================================

        User superAdmin = new User(
                "Dr. Eleanor Vance",
                "superadmin@vetmonk.ai",
                passwordEncoder.encode("Admin@12345"),
                Role.SUPER_ADMIN,
                "+1 (555) 000-0001"
        );

        superAdmin.setClinicId(savedClinic1.getId());

        userRepository.save(superAdmin);


        // ============================================================
        // 4. HOSPITAL 1 - CLINIC ADMIN
        // ============================================================

        User clinicAdmin1 = new User(
                "Marcus Sterling",
                "clinicadmin@vetmonk.ai",
                passwordEncoder.encode("Admin@12345"),
                Role.CLINIC_ADMIN,
                "+1 (555) 000-0002"
        );

        clinicAdmin1.setClinicId(savedClinic1.getId());

        userRepository.save(clinicAdmin1);


        // ============================================================
        // 5. HOSPITAL 1 - VETERINARIAN 1
        // ============================================================

        User vet1 = new User(
                "Dr. Sarah Jenkins",
                "vet.sarah@vetmonk.ai",
                passwordEncoder.encode("Vet@12345"),
                Role.VETERINARIAN,
                "+1 (555) 000-0003"
        );

        vet1.setClinicId(savedClinic1.getId());

        userRepository.save(vet1);


        // ============================================================
        // 6. HOSPITAL 1 - VETERINARIAN 2
        // ============================================================

        User vet2 = new User(
                "Dr. Rajesh Kumar",
                "vet.raj@vetmonk.ai",
                passwordEncoder.encode("Vet@12345"),
                Role.VETERINARIAN,
                "+1 (555) 000-0004"
        );

        vet2.setClinicId(savedClinic1.getId());

        userRepository.save(vet2);


        // ============================================================
        // 7. HOSPITAL 1 - RECEPTIONIST
        // ============================================================

        User receptionist1 = new User(
                "Emily Watson",
                "reception@vetmonk.ai",
                passwordEncoder.encode("Staff@12345"),
                Role.RECEPTIONIST,
                "+1 (555) 000-0005"
        );

        receptionist1.setClinicId(savedClinic1.getId());

        userRepository.save(receptionist1);


        // ============================================================
        // 8. HOSPITAL 2 - CLINIC ADMIN
        // ============================================================

        User clinicAdmin2 = new User(
                "David Wilson",
                "clinicadmin2@vetmonk.ai",
                passwordEncoder.encode("Admin2@12345"),
                Role.CLINIC_ADMIN,
                "+1 (555) 000-0010"
        );

        clinicAdmin2.setClinicId(savedClinic2.getId());

        userRepository.save(clinicAdmin2);


        // ============================================================
        // 9. HOSPITAL 2 - VETERINARIAN
        // ============================================================

        User vet3 = new User(
                "Dr. Priya Sharma",
                "vet.priya@vetmonk.ai",
                passwordEncoder.encode("Vet2@12345"),
                Role.VETERINARIAN,
                "+1 (555) 000-0011"
        );

        vet3.setClinicId(savedClinic2.getId());

        userRepository.save(vet3);


        // ============================================================
        // 10. HOSPITAL 2 - RECEPTIONIST
        // ============================================================

        User receptionist2 = new User(
                "Michael Brown",
                "reception2@vetmonk.ai",
                passwordEncoder.encode("Staff2@12345"),
                Role.RECEPTIONIST,
                "+1 (555) 000-0012"
        );

        receptionist2.setClinicId(savedClinic2.getId());

        userRepository.save(receptionist2);


        // ============================================================
        // 11. PET OWNER
        // ============================================================

        User petOwner = new User(
                "Alex Morgan",
                "owner.alex@vetmonk.ai",
                passwordEncoder.encode("Owner@12345"),
                Role.PET_OWNER,
                "+1 (555) 000-0006"
        );

        /*
         * Pet Owner is not a hospital staff account.
         *
         * Therefore clinicId is null.
         */
        petOwner.setClinicId(null);

        userRepository.save(petOwner);


        // ============================================================
        // 12. MEDICINE FORMULARY
        // ============================================================

        Medicine med1 = medicineRepository.save(
                new Medicine(
                        "Amoxicillin / Clavulanate",
                        "Clavamox",
                        "Antibiotic",
                        "Tablet",
                        "Broad-spectrum antibacterial for skin and soft-tissue infections",
                        "Zoetis"
                )
        );

        Medicine med2 = medicineRepository.save(
                new Medicine(
                        "Carprofen",
                        "Rimadyl",
                        "NSAID",
                        "Chewable Tablet",
                        "Non-steroidal anti-inflammatory for pain and arthritis relief in dogs",
                        "Zoetis"
                )
        );

        Medicine med3 = medicineRepository.save(
                new Medicine(
                        "Rabies Vaccine",
                        "Rabisin",
                        "Vaccine",
                        "Injectable",
                        "Inactivated rabies vaccine for dogs, cats, and ferrets",
                        "Boehringer Ingelheim"
                )
        );

        Medicine med4 = medicineRepository.save(
                new Medicine(
                        "Apoquel",
                        "Oclacitinib",
                        "Immunomodulator",
                        "Tablet",
                        "Targeted itch and allergy relief for canines",
                        "Zoetis"
                )
        );

        Medicine med5 = medicineRepository.save(
                new Medicine(
                        "Bravecto Chew",
                        "Fluralaner",
                        "Antiparasitic",
                        "Chewable",
                        "12-week flea and tick preventative",
                        "Merck Animal Health"
                )
        );


        // ============================================================
        // 13. HOSPITAL 1 INVENTORY
        // ============================================================

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic1,
                        med1,
                        "BAT-2026-001",
                        85,
                        "Tablets",
                        20,
                        1.85,
                        LocalDate.now().plusMonths(18),
                        "Apex Med Supplies",
                        LocalDate.now().minusMonths(1)
                )
        );

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic1,
                        med2,
                        "BAT-2026-002",
                        40,
                        "Tablets",
                        15,
                        2.40,
                        LocalDate.now().plusMonths(12),
                        "Apex Med Supplies",
                        LocalDate.now().minusMonths(2)
                )
        );

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic1,
                        med3,
                        "BAT-2026-003",
                        5,
                        "Vials",
                        15,
                        12.50,
                        LocalDate.now().plusDays(25),
                        "VetBio Labs",
                        LocalDate.now().minusMonths(6)
                )
        );

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic1,
                        med4,
                        "BAT-2026-004",
                        12,
                        "Tablets",
                        10,
                        3.10,
                        LocalDate.now().plusMonths(8),
                        "Zoetis Direct",
                        LocalDate.now().minusMonths(1)
                )
        );

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic1,
                        med5,
                        "BAT-2026-005",
                        25,
                        "Boxes",
                        10,
                        38.00,
                        LocalDate.now().plusMonths(24),
                        "Merck Distribution",
                        LocalDate.now().minusMonths(1)
                )
        );


        // ============================================================
        // 14. HOSPITAL 2 INVENTORY
        // ============================================================

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic2,
                        med1,
                        "GV-2026-001",
                        60,
                        "Tablets",
                        15,
                        1.85,
                        LocalDate.now().plusMonths(18),
                        "Green Valley Medical Supplies",
                        LocalDate.now().minusMonths(1)
                )
        );

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic2,
                        med2,
                        "GV-2026-002",
                        30,
                        "Tablets",
                        10,
                        2.40,
                        LocalDate.now().plusMonths(12),
                        "Green Valley Medical Supplies",
                        LocalDate.now().minusMonths(2)
                )
        );

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic2,
                        med3,
                        "GV-2026-003",
                        8,
                        "Vials",
                        10,
                        12.50,
                        LocalDate.now().plusDays(25),
                        "VetBio Labs",
                        LocalDate.now().minusMonths(5)
                )
        );

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic2,
                        med4,
                        "GV-2026-004",
                        10,
                        "Tablets",
                        8,
                        3.10,
                        LocalDate.now().plusMonths(8),
                        "Zoetis Direct",
                        LocalDate.now().minusMonths(1)
                )
        );

        inventoryItemRepository.save(
                new InventoryItem(
                        savedClinic2,
                        med5,
                        "GV-2026-005",
                        18,
                        "Boxes",
                        8,
                        38.00,
                        LocalDate.now().plusMonths(24),
                        "Merck Distribution",
                        LocalDate.now().minusMonths(1)
                )
        );


        // ============================================================
        // IMPORTANT
        // ============================================================
        //
        // We intentionally DO NOT create:
        //
        // Pet
        // Appointment
        // QueueEntry
        // Consultation
        // MedicalRecord
        // Prescription
        // VaccinationRecord
        // CustomerQuery
        // Vacancy
        //
        // These should come from actual application actions.
        // ============================================================

        logger.info(
                "Successfully created TWO hospitals and demo accounts."
        );

        logger.info(
                "Hospital 1: {} (ID={})",
                savedClinic1.getName(),
                savedClinic1.getId()
        );

        logger.info(
                "Hospital 2: {} (ID={})",
                savedClinic2.getName(),
                savedClinic2.getId()
        );

        logger.info(
                "Hospital 2 staff: Clinic Admin, Veterinarian and Receptionist."
        );

        logger.info(
                "No demo pets, appointments, queues, consultations, medical records, " +
                "vaccinations or customer queries were created."
        );
    }


    // ============================================================
    // RAG KNOWLEDGE BASE
    // ============================================================

    private void seedKnowledgeBase() {

        logger.info(
                "Initializing curated RAG knowledge base..."
        );


        KnowledgeDocument doc1 =
                knowledgeDocumentRepository.save(
                        new KnowledgeDocument(
                                "Canine Core Preventive Care & Vaccination Protocols",
                                "VACCINATION",
                                "AAHA / WSAVA Canine Vaccination Guidelines"
                        )
                );


        knowledgeChunkRepository.save(
                new KnowledgeChunk(
                        doc1,
                        1,
                        "Core canine vaccinations include Rabies, Canine Distemper Virus (CDV), "
                                + "Canine Adenovirus type 1 & 2 (CAV-1/CAV-2), and Canine Parvovirus "
                                + "(CPV-2). Puppies should start core vaccinations at 6-8 weeks of age, "
                                + "with boosters administered every 3-4 weeks until 16-20 weeks. "
                                + "Adult dogs require booster vaccinations every 1 to 3 years depending "
                                + "on local legal requirements and lifestyle risk.",
                        "canine, dog, puppy, core vaccine, rabies, distemper, parvovirus, schedule, booster, AAHA",
                        "VACCINATION"
                )
        );


        knowledgeChunkRepository.save(
                new KnowledgeChunk(
                        doc1,
                        2,
                        "Canine parasite prevention includes year-round heartworm prevention "
                                + "combined with broad-spectrum flea and tick control. Annual fecal "
                                + "examinations and heartworm antigen testing are important before "
                                + "initiating or continuing preventive medication.",
                        "parasite, heartworm, flea, tick, deworming, bravecto, nexgard, fecal test, preventative",
                        "PREVENTIVE_CARE"
                )
        );


        KnowledgeDocument doc2 =
                knowledgeDocumentRepository.save(
                        new KnowledgeDocument(
                                "Feline Wellness, Nutrition & Hydration Guidelines",
                                "NUTRITION",
                                "AAFP Feline Healthcare Protocols"
                        )
                );


        knowledgeChunkRepository.save(
                new KnowledgeChunk(
                        doc2,
                        1,
                        "Feline hydration is important for maintaining urinary and kidney health. "
                                + "Cats have a naturally low thirst drive, so high-moisture food and "
                                + "continuous access to fresh water can support healthy hydration.",
                        "cat, feline, hydration, water, kidney disease, urinary, flutd, wet food, nutrition",
                        "NUTRITION"
                )
        );


        KnowledgeDocument doc3 =
                knowledgeDocumentRepository.save(
                        new KnowledgeDocument(
                                "Veterinary Emergency Triage & Toxic Ingestion Protocol",
                                "EMERGENCY_CARE",
                                "Veterinary Emergency & Critical Care Society (VECCS)"
                        )
                );


        knowledgeChunkRepository.save(
                new KnowledgeChunk(
                        doc3,
                        1,
                        "Emergency red flags include difficulty breathing, severe active bleeding, "
                                + "seizures, loss of consciousness, inability to urinate, ingestion "
                                + "of dangerous toxins, or signs of bloat. These situations require "
                                + "immediate veterinary attention.",
                        "emergency, poison, toxic, chocolate, xylitol, seizure, unconscious, bloat, bleeding, breathing, lethal, lilies, urgent",
                        "EMERGENCY_CARE"
                )
        );


        logger.info(
                "Successfully initialized curated RAG knowledge base."
        );
    }
}