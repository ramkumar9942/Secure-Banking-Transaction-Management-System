package com.ramrk.bankingapp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ramrk.bankingapp.controller.AccountController;
import com.ramrk.bankingapp.dto.AccountDto;
import com.ramrk.bankingapp.dto.UpdateAccountRequest;
import com.ramrk.bankingapp.exception.GlobalExceptionHandler;
import com.ramrk.bankingapp.exception.ResourceNotFoundException;
import com.ramrk.bankingapp.service.AccountService;

public class AccountControllerMvcTest {

    private MockMvc mvc;

    @Mock
    private AccountService accountService;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        MockitoAnnotations.openMocks(this);
        AccountController controller = new AccountController(accountService);
        this.mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void update_success() throws Exception {
        UpdateAccountRequest req = new UpdateAccountRequest("New", "new@example.com");
        AccountDto dto = new AccountDto(1L, "ACC1", "New", "new@example.com", null, null, null);
        when(accountService.update(1L, req)).thenReturn(dto);

        mvc.perform(put("/api/accounts/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ownerName").value("New"));
    }

    @Test
    void update_notFound() throws Exception {
        UpdateAccountRequest req = new UpdateAccountRequest("New", "new@example.com");
        when(accountService.update(2L, req)).thenThrow(new ResourceNotFoundException("Account not found"));

        mvc.perform(put("/api/accounts/2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_success() throws Exception {
        mvc.perform(delete("/api/accounts/1")).andExpect(status().isNoContent());
    }

    @Test
    void delete_notFound() throws Exception {
        doThrow(new ResourceNotFoundException("Account not found")).when(accountService).delete(2L);

        mvc.perform(delete("/api/accounts/2")).andExpect(status().isNotFound());
    }
}