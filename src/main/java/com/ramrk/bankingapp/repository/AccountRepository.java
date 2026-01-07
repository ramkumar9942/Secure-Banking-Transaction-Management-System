package com.ramrk.bankingapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ramrk.bankingapp.model.Account;

/**
 * Spring Data JPA repository for Account entities.
 * Spring provides the implementation automatically at runtime.
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountNumber(String accountNumber);
}
