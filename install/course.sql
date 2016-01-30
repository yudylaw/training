/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50027
Source Host           : localhost:3306
Source Database       : thinksns_4_0

Target Server Type    : MYSQL
Target Server Version : 50027
File Encoding         : 65001

Date: 2016-01-30 21:54:50
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for ts_course
-- ----------------------------
DROP TABLE IF EXISTS `ts_course`;
CREATE TABLE `ts_course` (
  `id` int(11) NOT NULL auto_increment COMMENT '课程id',
  `title` varchar(100) NOT NULL COMMENT '课程名称',
  `creator` int(10) NOT NULL COMMENT '创建人id',
  `subject` int(10) NOT NULL COMMENT '学科类型',
  `required` tinyint(1) NOT NULL COMMENT '必修：1，选修：0',
  `description` varchar(200) default NULL COMMENT '课程描述',
  `ctime` int(10) NOT NULL COMMENT '创建时间',
  `is_del` tinyint(1) NOT NULL default '0' COMMENT '课程状态，1：正常，0：删除',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='课程';

-- ----------------------------
-- Table structure for ts_course_assign
-- ----------------------------
DROP TABLE IF EXISTS `ts_course_assign`;
CREATE TABLE `ts_course_assign` (
  `id` int(11) NOT NULL auto_increment,
  `classid` int(11) default NULL COMMENT '班级id',
  `courseid` int(11) default NULL COMMENT '课程id',
  `ctime` int(11) default NULL COMMENT '分配时间',
  `startdate` int(11) default NULL COMMENT '课程开始时间',
  `enddate` int(11) default NULL COMMENT '课程结束时间',
  `is_del` int(11) default '0' COMMENT '是否删除',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ts_course_learning
-- ----------------------------
DROP TABLE IF EXISTS `ts_course_learning`;
CREATE TABLE `ts_course_learning` (
  `id` int(11) NOT NULL auto_increment,
  `class_id` int(10) NOT NULL COMMENT '班级id',
  `uid` int(10) NOT NULL COMMENT '学习者id',
  `course_id` int(11) default NULL COMMENT '课程id',
  `ctime` int(10) NOT NULL COMMENT '创建时间',
  `start_date` int(11) default NULL COMMENT '课程开始学习时间',
  `end_date` int(11) default NULL COMMENT '课程结束学习时间',
  `percent` int(11) default '0' COMMENT '课程学习进度',
  `status` tinyint(1) NOT NULL default '0' COMMENT '课程状态，待定',
  `is_del` tinyint(1) NOT NULL COMMENT '1：正常，0：删除',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ts_course_resource
-- ----------------------------
DROP TABLE IF EXISTS `ts_course_resource`;
CREATE TABLE `ts_course_resource` (
  `id` int(11) NOT NULL auto_increment COMMENT '课程资源id',
  `title` text COMMENT '课程资源名称',
  `utime` int(11) default NULL COMMENT '上传时间',
  `ext` char(10) default NULL COMMENT '资源扩展名',
  `description` text COMMENT '资源描述',
  `course_id` int(11) default NULL COMMENT '资源属于哪个课程',
  `save_path` varchar(255) default NULL COMMENT '资源地址',
  `save_name` varchar(255) default NULL COMMENT '文件名',
  `is_del` tinyint(1) NOT NULL default '0' COMMENT '是否删除',
  `size` int(11) default NULL COMMENT '资源大小',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ts_course_resource_learning
-- ----------------------------
DROP TABLE IF EXISTS `ts_course_resource_learning`;
CREATE TABLE `ts_course_resource_learning` (
  `id` int(11) NOT NULL auto_increment COMMENT 'id主键',
  `classid` int(10) default NULL COMMENT '学习者班级id',
  `uid` int(10) default NULL COMMENT '学习者id',
  `resourceid` int(10) default NULL COMMENT '资源id',
  `percent` int(10) default NULL COMMENT '资源学习进度',
  `is_del` tinyint(1) default '0' COMMENT '是否删除',
  `start_date` int(11) default NULL COMMENT '资源开始学习时间',
  `end_date` int(11) default NULL COMMENT '资源结束学习时间',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
