package com.vetmonk.repository;

import com.vetmonk.entity.CustomerQuery;
import com.vetmonk.entity.QueryPriority;
import com.vetmonk.entity.QueryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerQueryRepository extends JpaRepository<CustomerQuery, Long> {

    List<CustomerQuery> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<CustomerQuery> findByUserId(Long userId, Pageable pageable);

    List<CustomerQuery> findByStatusOrderByCreatedAtDesc(QueryStatus status);

    List<CustomerQuery> findByPriorityOrderByCreatedAtDesc(QueryPriority priority);

    long countByStatus(QueryStatus status);
}
