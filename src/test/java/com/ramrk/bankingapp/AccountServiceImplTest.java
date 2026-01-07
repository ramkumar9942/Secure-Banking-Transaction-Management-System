package com.ramrk.bankingapp;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.ramrk.bankingapp.dto.UpdateAccountRequest;
import com.ramrk.bankingapp.exception.ResourceNotFoundException;
import com.ramrk.bankingapp.model.Account;
import com.ramrk.bankingapp.repository.AccountRepository;
import com.ramrk.bankingapp.service.impl.AccountServiceImpl;

public class AccountServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountServiceImpl accountService;

    @BeforeEach
    @SuppressWarnings("unused")
    void init() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void update_existingAccount_shouldReturnUpdatedDto() {
        Account existing = new Account(1L, "ACC123", "Old Name", "old@example.com", BigDecimal.ZERO, null, null);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateAccountRequest req = new UpdateAccountRequest("New Name", "new@example.com");

        var dto = accountService.update(1L, req);

        assertThat(dto.getOwnerName()).isEqualTo("New Name");
        assertThat(dto.getEmail()).isEqualTo("new@example.com");
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void update_missingAccount_shouldThrow() {
        when(accountRepository.findById(2L)).thenReturn(Optional.empty());
        UpdateAccountRequest req = new UpdateAccountRequest("Name", "email@example.com");
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> accountService.update(2L, req));
        // ensure exception instance is observed to satisfy static analysis
        assertThat(ex).isNotNull();
        // optional: assert on message if desired
        // assertThat(ex.getMessage()).contains("not found");
    }

    @Test
    void delete_existingAccount_shouldCallDelete() {
        Account existing = new Account(3L, "ACC333", "User", "u@example.com", BigDecimal.ZERO, null, null);
        when(accountRepository.findById(3L)).thenReturn(Optional.of(existing));

        accountService.delete(3L);

        verify(accountRepository).delete(existing);
    }

    @Test
    void delete_missingAccount_shouldThrow() {
        when(accountRepository.findById(4L)).thenReturn(Optional.empty());
        ResourceNotFoundException ex2 = assertThrows(ResourceNotFoundException.class, () -> accountService.delete(4L));
        // ensure exception instance is observed to satisfy static analysis
        assertThat(ex2).isNotNull();
        // optional: assert on message if desired
        // assertThat(ex2.getMessage()).contains("not found");
    }
}