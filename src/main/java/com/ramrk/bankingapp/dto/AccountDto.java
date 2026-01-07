package com.ramrk.bankingapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;


/** Lightweight DTO returned to clients with account details. */
public class AccountDto {
    private Long id;
    private String accountNumber;
    private String ownerName;
    private String email;
    private BigDecimal balance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AccountDto() {}

    public AccountDto(Long id, String accountNumber, String ownerName, String email, BigDecimal balance, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.email = email;
        this.balance = balance;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public String getAccountNumber() { return accountNumber; }
    public String getOwnerName() { return ownerName; }
    public String getEmail() { return email; }
    public BigDecimal getBalance() { return balance; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String accountNumber;
        private String ownerName;
        private String email;
        private BigDecimal balance;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder accountNumber(String accountNumber) { this.accountNumber = accountNumber; return this; }
        public Builder ownerName(String ownerName) { this.ownerName = ownerName; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder balance(BigDecimal balance) { this.balance = balance; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public AccountDto build() {
            return new AccountDto(id, accountNumber, ownerName, email, balance, createdAt, updatedAt);
        }
    }
}
