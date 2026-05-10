package handlers

import (
	"math-association/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ContactHandler struct {
	DB *gorm.DB
}

func (h *ContactHandler) SubmitContact(c *gin.Context) {
	var contact models.Contact
	if err := c.ShouldBindJSON(&contact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}
	if err := h.DB.Create(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "提交失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "留言提交成功"})
}

func (h *ContactHandler) GetContacts(c *gin.Context) {
	var contacts []models.Contact
	h.DB.Order("created_at DESC").Find(&contacts)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": contacts})
}

func (h *ContactHandler) MarkRead(c *gin.Context) {
	id := c.Param("id")
	idNum, _ := strconv.Atoi(id)
	h.DB.Model(&models.Contact{}).Where("id = ?", idNum).Update("is_read", true)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "已标记为已读"})
}

func (h *ContactHandler) DeleteContact(c *gin.Context) {
	id := c.Param("id")
	idNum, _ := strconv.Atoi(id)
	if err := h.DB.Delete(&models.Contact{}, idNum).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
