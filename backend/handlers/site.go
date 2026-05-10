package handlers

import (
	"math-association/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SiteHandler struct {
	DB *gorm.DB
}

// GetSiteConfig returns public site configuration
func (h *SiteHandler) GetSiteConfig(c *gin.Context) {
	var configs []models.SiteConfig
	h.DB.Find(&configs)

	result := make(map[string]string)
	for _, cfg := range configs {
		result[cfg.Key] = cfg.Value
	}

	// Default values if not set
	defaults := map[string]string{
		"site_name":        "数学协会",
		"site_slogan":      "探索数学之美，启迪智慧之光",
		"site_description": "数学协会官方门户网站",
		"site_logo":        "",
		"contact_email":    "",
		"contact_phone":    "",
		"contact_address":  "",
	}
	for k, v := range defaults {
		if _, ok := result[k]; !ok {
			result[k] = v
		}
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

// UpdateSiteConfig for admin use
func (h *SiteHandler) UpdateSiteConfig(c *gin.Context) {
	var configs map[string]string
	if err := c.ShouldBindJSON(&configs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	for key, value := range configs {
		var cfg models.SiteConfig
		result := h.DB.Where("key = ?", key).First(&cfg)
		if result.Error != nil {
			h.DB.Create(&models.SiteConfig{Key: key, Value: value})
		} else {
			h.DB.Model(&cfg).Update("value", value)
		}
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "配置更新成功"})
}
