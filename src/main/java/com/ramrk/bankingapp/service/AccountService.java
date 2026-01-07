package com.ramrk.bankingapp.service;

import java.util.List;

import com.ramrk.bankingapp.dto.AccountDto;
import com.ramrk.bankingapp.dto.CreateAccountRequest;
import com.ramrk.bankingapp.dto.UpdateAccountRequest;

/**
 * Service layer for account operations. Keeps business logic separated from controllers.
 */
public interface AccountService {
    /** Create a new account */
    AccountDto create(CreateAccountRequest request);

    /** Get an account by its id */
    AccountDto getById(Long id);

    /** List all accounts */
    List<AccountDto> getAll();

    /** Update account metadata (owner, email) */
    AccountDto update(Long id, UpdateAccountRequest request);

    /** Delete an account */
    void delete(Long id);
}
