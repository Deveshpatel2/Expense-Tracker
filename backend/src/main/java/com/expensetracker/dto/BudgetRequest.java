package com.expensetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BudgetRequest {

    @NotBlank
    @Size(max = 100)
    private String category;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;

    @NotBlank
    @Size(max = 10)
    private String currency;

    @NotNull
    private LocalDate budgetMonth;

    @Size(max = 500)
    private String notes;

    private Integer alertThreshold = 80;

    private Boolean isTemplate = false;

    @Size(max = 50)
    private String templateName;

    // Constructors
    public BudgetRequest() {
    }

    public BudgetRequest(String category, BigDecimal amount, String currency,
            LocalDate budgetMonth, String notes, Integer alertThreshold,
            Boolean isTemplate, String templateName) {
        this.category = category;
        this.amount = amount;
        this.currency = currency;
        this.budgetMonth = budgetMonth;
        this.notes = notes;
        this.alertThreshold = alertThreshold;
        this.isTemplate = isTemplate;
        this.templateName = templateName;
    }

    // Getters and Setters
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDate getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(LocalDate budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getAlertThreshold() {
        return alertThreshold;
    }

    public void setAlertThreshold(Integer alertThreshold) {
        this.alertThreshold = alertThreshold;
    }

    public Boolean getIsTemplate() {
        return isTemplate;
    }

    public void setIsTemplate(Boolean isTemplate) {
        this.isTemplate = isTemplate;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }
}
