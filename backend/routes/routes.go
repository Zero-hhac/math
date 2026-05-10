package routes

import (
	"math-association/handlers"
	"math-association/middleware"
	"math-association/models"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB, uploadDir string) *gin.Engine {
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Static files
	r.Static("/uploads", uploadDir)

// Initialize handlers
	authHandler := &handlers.AuthHandler{DB: db}
	articleHandler := &handlers.ArticleHandler{DB: db}
	competitionHandler := &handlers.CompetitionHandler{DB: db}
	contactHandler := &handlers.ContactHandler{DB: db}
	docHandler := &handlers.DocumentHandler{DB: db}
	resourceHandler := &handlers.ResourceHandler{DB: db}
	memberHandler := &handlers.MemberShowcaseHandler{DB: db}
	userHandler := &handlers.UserManageHandler{DB: db}
	activityHandler := &handlers.ActivityHandler{DB: db}
	uploadHandler := &handlers.UploadHandler{UploadDir: uploadDir}

	// ===== Public API =====
	r.GET("/api/competitions", competitionHandler.GetCompetitions)
	r.GET("/api/news", func(c *gin.Context) {
		articleHandler.GetPublicArticles(c)
	})
	r.GET("/api/members", func(c *gin.Context) {
		memberHandler.GetPublicMembers(c)
	})
	r.GET("/api/documents", docHandler.GetPublicDocuments)
	r.GET("/api/activities", activityHandler.GetPublicActivities)
	r.POST("/api/contact", contactHandler.SubmitContact)

	// ===== Admin Auth =====
	r.POST("/api/admin/login", authHandler.AdminLoginAdapter)

	// ===== Member-or-Admin Read Routes =====
	// Any authenticated user (member, admin, super_admin) can read these.
	authed := r.Group("/api/admin")
	authed.Use(middleware.AuthRequired())
	{
		authed.GET("/documents", docHandler.GetDocuments)
		authed.GET("/resources", resourceHandler.GetResources)
		authed.GET("/members", memberHandler.GetAllMembers)
	}

	// ===== Admin Protected Routes =====
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthRequired(), middleware.AdminRequired())
	{
		admin.GET("/stats", func(c *gin.Context) {
			statsHandler{DB: db}.GetStats(c)
		})

		// Contacts
		admin.GET("/contacts", contactHandler.GetContacts)
		admin.PUT("/contacts/:id/read", contactHandler.MarkRead)
		admin.DELETE("/contacts/:id", contactHandler.DeleteContact)

		// Competitions CRUD
		admin.GET("/competitions", competitionHandler.GetCompetitions)
		admin.POST("/competitions", competitionHandler.CreateCompetition)
		admin.PUT("/competitions/:id", competitionHandler.UpdateCompetition)
		admin.DELETE("/competitions/:id", competitionHandler.DeleteCompetition)

		// News CRUD
		admin.GET("/news", articleHandler.GetAllArticles)
		admin.POST("/news", articleHandler.CreateArticle)
		admin.PUT("/news/:id", articleHandler.UpdateArticle)
		admin.DELETE("/news/:id", articleHandler.DeleteArticle)

		// Members CRUD (write only — read is exposed above for all authed users)
		admin.POST("/members", memberHandler.CreateShowcase)
		admin.PUT("/members/:id", memberHandler.UpdateShowcase)
		admin.DELETE("/members/:id", memberHandler.DeleteShowcase)

		// Documents CRUD
		admin.POST("/documents", docHandler.CreateDocument)
		admin.PUT("/documents/:id", docHandler.UpdateDocument)
		admin.DELETE("/documents/:id", docHandler.DeleteDocument)

		// Activities CRUD
		admin.GET("/activities", activityHandler.GetAllActivities)
		admin.POST("/activities", activityHandler.CreateActivity)
		admin.PUT("/activities/:id", activityHandler.UpdateActivity)
		admin.DELETE("/activities/:id", activityHandler.DeleteActivity)

		// Upload
		admin.POST("/upload", uploadHandler.UploadFile)
		admin.POST("/upload/image", uploadHandler.UploadImage)

		// Users management (super admin only)
		admin.GET("/users", middleware.SuperAdminRequired(), func(c *gin.Context) {
			userHandler.ListUsers(c)
		})
		admin.POST("/users", middleware.SuperAdminRequired(), func(c *gin.Context) {
			userHandler.CreateUser(c)
		})
		admin.PUT("/users/:id", middleware.SuperAdminRequired(), func(c *gin.Context) {
			userHandler.UpdateUser(c)
		})
		admin.DELETE("/users/:id", middleware.SuperAdminRequired(), func(c *gin.Context) {
			userHandler.DeleteUser(c)
		})
		admin.PUT("/users/:id/reset-password", middleware.SuperAdminRequired(), func(c *gin.Context) {
			userHandler.ResetPassword(c)
		})
	}

	return r
}

// statsHandler provides dashboard stats
type statsHandler struct {
	DB *gorm.DB
}

func (h statsHandler) GetStats(c *gin.Context) {
	var compCount, newsCount, memberCount, contactCount, docCount, resCount, activityCount int64
	h.DB.Model(&models.Competition{}).Count(&compCount)
	h.DB.Model(&models.Article{}).Count(&newsCount)
	h.DB.Model(&models.MemberShowcase{}).Count(&memberCount)
	h.DB.Model(&models.Contact{}).Count(&contactCount)
	h.DB.Model(&models.Document{}).Count(&docCount)
	h.DB.Model(&models.Resource{}).Count(&resCount)
	h.DB.Model(&models.Activity{}).Count(&activityCount)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"competitions": compCount,
			"news":         newsCount,
			"members":      memberCount,
			"contacts":     contactCount,
			"documents":    docCount,
			"resources":    resCount,
			"activities":   activityCount,
		},
	})
}
