package com.ramrk.bankingapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Request model for updating account metadata (owner and email). */
public class UpdateAccountRequest {

    /** Owner full name */
    @NotBlank
    private String ownerName;

    /** Contact email */
    @Email
    private String email;

    public UpdateAccountRequest() {}

    public UpdateAccountRequest(String ownerName, String email) {
        this.ownerName = ownerName;
        this.email = email;
    }

    public String getOwnerName() { return ownerName; }
    public String getEmail() { return email; }
}
