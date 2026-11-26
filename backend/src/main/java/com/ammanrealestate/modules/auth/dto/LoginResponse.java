package com.ammanrealestate.modules.auth.dto;

/**
 * Successful authentication response containing JWT bearer token, expiration, and admin profile.
 */
public class LoginResponse {

    private String accessToken;
    private String tokenType;
    private long expiresIn;
    private AdminSummaryDto admin;

    public LoginResponse() {
        this.tokenType = "Bearer";
    }

    public LoginResponse(String accessToken, long expiresIn, AdminSummaryDto admin) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.admin = admin;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public AdminSummaryDto getAdmin() {
        return admin;
    }

    public void setAdmin(AdminSummaryDto admin) {
        this.admin = admin;
    }
}
