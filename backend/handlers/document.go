package handlers

import (
	"math-association/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DocumentHandler struct {
	DB *gorm.DB
}

func (h *DocumentHandler) GetDocuments(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID := c.Query("category_id")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 10
	}

	query := h.DB.Where("is_published = ?", true).
		Where("(visibility = ? OR visibility = ?) AND (publish_at IS NULL OR publish_at <= ?)", "members", "both", time.Now())
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	var total int64
	query.Model(&models.Document{}).Count(&total)

	var docs []models.Document
	query.Preload("Category").Preload("Uploader").
		Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&docs)

	for i := range docs {
		docs[i].Uploader.Password = ""
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      docs,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func (h *DocumentHandler) CreateDocument(c *gin.Context) {
	var doc models.Document
	if err := c.ShouldBindJSON(&doc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	doc.UploaderID = c.GetUint("user_id")
	if err := h.DB.Create(&doc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": doc, "message": "创建成功"})
}

func (h *DocumentHandler) UpdateDocument(c *gin.Context) {
	id := c.Param("id")
	var doc models.Document
	if err := h.DB.First(&doc, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "文档不存在"})
		return
	}

	if err := c.ShouldBindJSON(&doc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	h.DB.Model(&doc).Updates(doc)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (h *DocumentHandler) DeleteDocument(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.Document{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func (h *DocumentHandler) GetDocumentDetail(c *gin.Context) {
	id := c.Param("id")
	var doc models.Document
	if err := h.DB.Preload("Category").Preload("Uploader").First(&doc, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "文档不存在"})
		return
	}
	doc.Uploader.Password = ""
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": doc})
}

// GetPublicDocuments returns published documents for public viewing (no auth required)
func (h *DocumentHandler) GetPublicDocuments(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 20
	}

	query := h.DB.Where("is_published = ? AND (visibility = ? OR visibility = ?)", true, "public", "both").
		Where("publish_at IS NULL OR publish_at <= ?", time.Now())

	var total int64
	query.Model(&models.Document{}).Count(&total)

	var docs []models.Document
	query.Preload("Uploader").
		Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&docs)

	for i := range docs {
		docs[i].Uploader.Password = ""
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      docs,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// DownloadDocument increments download count and redirects to file
func (h *DocumentHandler) DownloadDocument(c *gin.Context) {
	id := c.Param("id")
	var doc models.Document
	if err := h.DB.First(&doc, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "文档不存在"})
		return
	}
	h.DB.Model(&doc).UpdateColumn("download_count", gorm.Expr("download_count + ?", 1))
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": doc})
}
