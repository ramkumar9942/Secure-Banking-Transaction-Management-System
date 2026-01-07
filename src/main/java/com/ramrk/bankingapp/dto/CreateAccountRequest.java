package com.ramrk.bankingapp.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
/** Request model for creating an account. */
public class CreateAccountRequest {

    /** Full name of the account owner */
    @NotBlank
    private String ownerName;

    /** Contact email (optional but validated if present) */
    @Email
    private String email;

    /** Initial deposit amount, must not be null */
    @NotNull
    private BigDecimal initialDeposit;

    public CreateAccountRequest() {}

    public CreateAccountRequest(String ownerName, String email, BigDecimal initialDeposit) {
        this.ownerName = ownerName;
        this.email = email;
        this.initialDeposit = initialDeposit;
    }

    public String getOwnerName() { return ownerName; }
    public String getEmail() { return email; }
    public BigDecimal getInitialDeposit() { return initialDeposit; }
}
