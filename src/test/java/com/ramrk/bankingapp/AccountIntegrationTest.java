package com.ramrk.bankingapp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ramrk.bankingapp.dto.AccountDto;
import com.ramrk.bankingapp.dto.CreateAccountRequest;
import com.ramrk.bankingapp.dto.UpdateAccountRequest;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
})
public class AccountIntegrationTest {

    @Autowired
    private WebApplicationContext wac;

    private MockMvc mvc;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        this.mvc = MockMvcBuilders.webAppContextSetup(this.wac).build();
    }

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void fullCrudFlow_create_update_delete_and_notFound() throws Exception {
        // Create
        CreateAccountRequest create = new CreateAccountRequest("Alice", "alice@example.com", new java.math.BigDecimal("100.00"));
        MvcResult createResult = mvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(create)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ownerName").value("Alice"))
                .andReturn();

        String createJson = createResult.getResponse().getContentAsString();
        AccountDto created = mapper.readValue(createJson, AccountDto.class);
        Long id = created.getId();

        // Update
        UpdateAccountRequest update = new UpdateAccountRequest("Alice Cooper", "acooper@example.com");
        mvc.perform(put("/api/accounts/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ownerName").value("Alice Cooper"))
                .andExpect(jsonPath("$.email").value("acooper@example.com"));

        // Delete
        mvc.perform(delete("/api/accounts/" + id)).andExpect(status().isNoContent());

        // Confirm deletion -> 404
        mvc.perform(get("/api/accounts/" + id)).andExpect(status().isNotFound());
    }
}
