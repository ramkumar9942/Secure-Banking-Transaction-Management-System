package com.ramrk.bankingapp.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ramrk.bankingapp.dto.AccountDto;
import com.ramrk.bankingapp.dto.CreateAccountRequest;
import com.ramrk.bankingapp.dto.UpdateAccountRequest;
import com.ramrk.bankingapp.exception.ResourceNotFoundException;
import com.ramrk.bankingapp.model.Account;
import com.ramrk.bankingapp.repository.AccountRepository;
import com.ramrk.bankingapp.service.AccountService;


@Service
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    public AccountServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * Create a new account from the request. Generates a unique account number.
     */
    @Override
    public AccountDto create(CreateAccountRequest request) {
        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .ownerName(request.getOwnerName())
                .email(request.getEmail())
                .balance(request.getInitialDeposit() == null ? BigDecimal.ZERO : request.getInitialDeposit())
                .build();
        Account saved = accountRepository.save(account);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountDto getById(Long id) {
        Account a = accountRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return toDto(a);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountDto> getAll() {
        return accountRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public AccountDto update(Long id, UpdateAccountRequest request) {
        Account a = accountRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        a.setOwnerName(request.getOwnerName());
        a.setEmail(request.getEmail());
        Account updated = accountRepository.save(a);
        return toDto(updated);
    }

    @Override
    public void delete(Long id) {
        Account a = accountRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        accountRepository.delete(a);
    }

    private AccountDto toDto(Account a) {
        return AccountDto.builder()
                .id(a.getId())
                .accountNumber(a.getAccountNumber())
                .ownerName(a.getOwnerName())
                .email(a.getEmail())
                .balance(a.getBalance())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

    private String generateAccountNumber() {
        // simple unique account number
        return UUID.randomUUID().toString().replace("-", "").substring(0, 18).toUpperCase();
    }
}
