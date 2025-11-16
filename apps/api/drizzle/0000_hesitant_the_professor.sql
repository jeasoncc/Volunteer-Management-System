CREATE TABLE `admin` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`role` enum('super','admin','operator') NOT NULL,
	`permissions` json,
	`last_login` timestamp,
	`login_ip` varchar(50),
	`login_count` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`department` varchar(50),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chanting_schedule` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`location` enum('fuhuiyuan','waiqin') DEFAULT 'fuhuiyuan',
	`date` date NOT NULL,
	`time_slot` varchar(20) NOT NULL,
	`bell_volunteer_id` bigint unsigned,
	`teaching_volunteer_id` bigint unsigned,
	`backup_volunteer_id` bigint unsigned,
	`deceased_id` bigint unsigned NOT NULL,
	`status` enum('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
	`actual_start_time` timestamp,
	`actual_end_time` timestamp,
	`feedback` text,
	`expected_participants` int,
	`special_requirements` text,
	`created_by` bigint unsigned,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chanting_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deceased` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`title` varchar(20) NOT NULL,
	`chant_number` varchar(20),
	`chantPostion` enum('room-one','room-two','room-three','room-four','unknow') DEFAULT 'unknow',
	`gender` enum('male','female','other') NOT NULL,
	`death_date` date NOT NULL,
	`death_time` time,
	`age` int,
	`visit_time` timestamp,
	`visitation_team` json,
	`birth_date` date,
	`religion` varchar(50),
	`is_ordained` boolean DEFAULT false,
	`address` text NOT NULL,
	`cause_of_death` text,
	`family_contact` varchar(50),
	`family_relationship` varchar(50),
	`phone` varchar(20) NOT NULL,
	`special_notes` text,
	`funeral_arrangements` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `deceased_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `volunteer` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`lotus_id` varchar(50),
	`volunteer_id` varchar(50),
	`id_number` varchar(18) NOT NULL,
	`lotus_role` enum('admin','volunteer','resident') DEFAULT 'volunteer',
	`account` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`name` varchar(50) NOT NULL,
	`gender` enum('male','female','other') NOT NULL,
	`birth_date` date,
	`phone` varchar(20) NOT NULL,
	`wechat` varchar(50),
	`email` varchar(100),
	`address` text,
	`avatar` text,
	`education` enum('none','elementary','middle_school','high_school','bachelor','master','phd','other') DEFAULT 'high_school',
	`has_buddhism_faith` boolean DEFAULT false,
	`refuge_status` enum('none','took_refuge','five_precepts','bodhisattva') DEFAULT 'none',
	`health_conditions` enum('healthy','has_chronic_disease','has_disability','has_allergies','recovering_from_illness','other_conditions') DEFAULT 'healthy',
	`religious_background` enum('upasaka','upasika','sramanera','sramanerika','bhikkhu','bhikkhuni','anagarika','siladhara','novice_monk','buddhist_visitor','none') DEFAULT 'upasaka',
	`join_reason` text,
	`hobbies` text,
	`available_times` varchar(255),
	`training_records` varchar(255),
	`service_hours` int DEFAULT 0,
	`is_certified` boolean DEFAULT false,
	`emergency_contact` varchar(50),
	`family_consent` enum('approved','partial','rejected','self_decided') DEFAULT 'self_decided',
	`notes` text,
	`reviewer` varchar(100),
	`volunteer_status` enum('applicant','trainee','registered','inactive','suspended') DEFAULT 'applicant',
	`signed_commitment` boolean DEFAULT false,
	`commitment_signed_date` date,
	`sever_position` enum('kitchen','chanting','cleaning','reception','security','office','other') DEFAULT 'other',
	`status` enum('active','inactive','applicant','trainee','registered','suspended') DEFAULT 'applicant',
	`member_status` enum('volunteer','resident') DEFAULT 'volunteer',
	`room_id` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `volunteer_id` PRIMARY KEY(`id`),
	CONSTRAINT `volunteer_lotus_id_unique` UNIQUE(`lotus_id`),
	CONSTRAINT `volunteer_volunteer_id_unique` UNIQUE(`volunteer_id`),
	CONSTRAINT `volunteer_id_number_unique` UNIQUE(`id_number`),
	CONSTRAINT `volunteer_account_unique` UNIQUE(`account`)
);
--> statement-breakpoint
CREATE TABLE `volunteer_checkin` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`lotus_id` varchar(50) NOT NULL,
	`name` varchar(50) NOT NULL,
	`originTime` varchar(50),
	`recordId` varchar(100),
	`date` date NOT NULL,
	`check_in` time,
	`recordType` varchar(50),
	`status` enum('present','late','early_leave','absent','on_leave') DEFAULT 'present',
	`location` varchar(100) DEFAULT '深圳市龙岗区慈海医院福慧园七栋一楼',
	`device_id` varchar(50) DEFAULT 'YET88476',
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `volunteer_checkin_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin` ADD CONSTRAINT `admin_id_volunteer_id_fk` FOREIGN KEY (`id`) REFERENCES `volunteer`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chanting_schedule` ADD CONSTRAINT `chanting_schedule_bell_volunteer_id_volunteer_id_fk` FOREIGN KEY (`bell_volunteer_id`) REFERENCES `volunteer`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chanting_schedule` ADD CONSTRAINT `chanting_schedule_teaching_volunteer_id_volunteer_id_fk` FOREIGN KEY (`teaching_volunteer_id`) REFERENCES `volunteer`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chanting_schedule` ADD CONSTRAINT `chanting_schedule_backup_volunteer_id_volunteer_id_fk` FOREIGN KEY (`backup_volunteer_id`) REFERENCES `volunteer`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chanting_schedule` ADD CONSTRAINT `chanting_schedule_deceased_id_deceased_id_fk` FOREIGN KEY (`deceased_id`) REFERENCES `deceased`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chanting_schedule` ADD CONSTRAINT `chanting_schedule_created_by_volunteer_id_fk` FOREIGN KEY (`created_by`) REFERENCES `volunteer`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `volunteer_checkin` ADD CONSTRAINT `volunteer_checkin_lotus_id_volunteer_lotus_id_fk` FOREIGN KEY (`lotus_id`) REFERENCES `volunteer`(`lotus_id`) ON DELETE cascade ON UPDATE cascade;