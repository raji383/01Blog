package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class BanUserRequest extends AdminActionRequest {

    @NotNull
    private Boolean banned;
}
