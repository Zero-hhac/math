package models

import (
	"time"

	"gorm.io/gorm"
)

// User roles
const (
	RoleSuperAdmin = "super_admin"
	RoleAdmin      = "admin"
	RoleMember     = "member"
)

// User represents a member or administrator
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"uniqueIndex;size:64;not null" json:"username"`
	Password  string         `gorm:"size:256;not null" json:"-"`
	Nickname  string         `gorm:"size:128" json:"nickname"`
	Email     string         `gorm:"size:128" json:"email"`
	Phone     string         `gorm:"size:32" json:"phone"`
	Avatar    string         `gorm:"size:512" json:"avatar"`
	Role      string         `gorm:"size:32;default:member" json:"role"`
	Status    int            `gorm:"default:1" json:"status"` // 1=active, 0=disabled
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Category for articles and resources
type Category struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:128;not null" json:"name"`
	Slug      string         `gorm:"uniqueIndex;size:128" json:"slug"`
	Type      string         `gorm:"size:32;not null" json:"type"` // news, knowledge, resource, document
	SortOrder int            `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Article represents news or knowledge-base articles
type Article struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"size:256;not null" json:"title"`
	Slug        string         `gorm:"uniqueIndex;size:256" json:"slug"`
	Content     string         `gorm:"type:text" json:"content"`
	Summary     string         `gorm:"size:512" json:"summary"`
	CoverImage  string         `gorm:"size:512" json:"cover_image"`
	Type        string         `gorm:"size:32;not null" json:"type"` // news, knowledge
	CategoryID  uint           `json:"category_id"`
	Category    Category       `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	AuthorID    uint           `json:"author_id"`
	Author      User           `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	IsPinned    bool           `gorm:"default:false" json:"is_pinned"`
	IsPublished bool           `gorm:"default:false" json:"is_published"`
	Visibility  string         `gorm:"size:32;default:public" json:"visibility"` // public, members, both
	PublishAt   *time.Time     `json:"publish_at"`                                // scheduled publish time, null = immediate
	ViewCount   int            `gorm:"default:0" json:"view_count"`
	Tags        string         `gorm:"size:512" json:"tags"` // comma separated
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Document represents internal documents for members
type Document struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"size:256;not null" json:"title"`
	Description string         `gorm:"size:1024" json:"description"`
	FilePath    string         `gorm:"size:512" json:"file_path"`
	FileSize    int64          `json:"file_size"`
	FileType    string         `gorm:"size:64" json:"file_type"`
	CategoryID  uint           `json:"category_id"`
	Category    Category       `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	UploaderID  uint           `json:"uploader_id"`
	Uploader    User           `gorm:"foreignKey:UploaderID" json:"uploader,omitempty"`
	DownloadCnt int            `gorm:"default:0" json:"download_count"`
	IsPublished bool           `gorm:"default:false" json:"is_published"`
	Visibility  string         `gorm:"size:32;default:members" json:"visibility"` // public, members, both
	PublishAt   *time.Time     `json:"publish_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Resource represents study resources (question banks, videos, etc.)
type Resource struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"size:256;not null" json:"title"`
	Description string         `gorm:"size:1024" json:"description"`
	Content     string         `gorm:"type:text" json:"content"`
	FileURL     string         `gorm:"size:512" json:"file_url"`
	ResourceType string        `gorm:"size:32" json:"resource_type"` // question_bank, lecture, video, book
	CategoryID  uint           `json:"category_id"`
	Category    Category       `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	UploaderID  uint           `json:"uploader_id"`
	Uploader    User           `gorm:"foreignKey:UploaderID" json:"uploader,omitempty"`
	Difficulty  int            `gorm:"default:1" json:"difficulty"` // 1-5
	IsPublished bool           `gorm:"default:false" json:"is_published"`
	ViewCount   int            `gorm:"default:0" json:"view_count"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// MemberShowcase represents public member profiles
type MemberShowcase struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	UserID      uint           `gorm:"uniqueIndex" json:"user_id"`
	User        User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Bio         string         `gorm:"size:1024" json:"bio"`
	Achievement string         `gorm:"size:1024" json:"achievement"`
	Department  string         `gorm:"size:128" json:"department"`
	Grade       string         `gorm:"size:64" json:"grade"`
	Skills      string         `gorm:"size:512" json:"skills"`
	IsPublic    bool           `gorm:"default:false" json:"is_public"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// SiteConfig represents site-wide configuration
type SiteConfig struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Key       string    `gorm:"uniqueIndex;size:128;not null" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Competition represents math competition information
type Competition struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"size:256;not null" json:"name"`
	ShortName    string         `gorm:"size:128" json:"short_name"`
	Organizer    string         `gorm:"size:256" json:"organizer"`
	Time         string         `gorm:"size:256" json:"time"`
	Frequency    string         `gorm:"size:128" json:"frequency"`
	Participants string         `gorm:"size:256" json:"participants"`
	Description  string         `gorm:"type:text" json:"description"`
	Difficulty   int            `gorm:"default:3" json:"difficulty"`
	Website      string         `gorm:"size:512" json:"website"`
	Icon         string         `gorm:"size:64;default:∫" json:"icon"`
	Category     string         `gorm:"size:128" json:"category"`
	Tags         string         `gorm:"size:1024" json:"tags"`
	Prize        string         `gorm:"type:text" json:"prize"`
	PrepTips     string         `gorm:"type:text" json:"prep_tips"`
	Format       string         `gorm:"size:256" json:"format"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// Activity represents association activities
type Activity struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"size:256;not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Period      string         `gorm:"size:128" json:"period"` // e.g. 每周、每月、期中
	Icon        string         `gorm:"size:16;default:📅" json:"icon"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	IsPublished bool           `gorm:"default:false" json:"is_published"`
	Visibility  string         `gorm:"size:32;default:public" json:"visibility"` // public, members, both
	PublishAt   *time.Time     `json:"publish_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Contact represents a contact form submission
type Contact struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:128;not null" json:"name"`
	Email     string         `gorm:"size:128;not null" json:"email"`
	Phone     string         `gorm:"size:64" json:"phone"`
	Subject   string         `gorm:"size:256" json:"subject"`
	Message   string         `gorm:"type:text;not null" json:"message"`
	IsRead    bool           `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// LoginLog for audit trail
type LoginLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	IP        string    `gorm:"size:64" json:"ip"`
	UserAgent string    `gorm:"size:512" json:"user_agent"`
	CreatedAt time.Time `json:"created_at"`
}
