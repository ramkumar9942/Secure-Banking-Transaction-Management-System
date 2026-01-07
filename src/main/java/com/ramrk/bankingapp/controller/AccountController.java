package com.ramrk.bankingapp.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ramrk.bankingapp.dto.AccountDto;
import com.ramrk.bankingapp.dto.CreateAccountRequest;
import com.ramrk.bankingapp.dto.UpdateAccountRequest;
import com.ramrk.bankingapp.service.AccountService;


@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Create an account
     * POST /api/accounts
     */
    @PostMapping
    public ResponseEntity<AccountDto> create(@Validated @RequestBody CreateAccountRequest req) {
        AccountDto dto = accountService.create(req);
        return ResponseEntity.created(URI.create("/api/accounts/" + dto.getId())).body(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<AccountDto>> list() {
        return ResponseEntity.ok(accountService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountDto> update(@PathVariable Long id, @Validated @RequestBody UpdateAccountRequest req) {
        return ResponseEntity.ok(accountService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
