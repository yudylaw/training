--
-- 转存表中的数据 `ts_system_config`
--
DELETE FROM `ts_system_config` WHERE `list` = 'pageKey' AND `key` = 'admin_Application_about';
INSERT INTO `ts_system_config` (`list`, `key`, `value`, `mtime`) VALUES
('pageKey', 'admin_Application_about', 'a:6:{s:3:"key";a:1:{s:5:"about";s:5:"about";}s:8:"key_name";a:1:{s:5:"about";s:12:"关于我们";}s:8:"key_type";a:1:{s:5:"about";s:6:"editor";}s:11:"key_default";a:1:{s:5:"about";s:0:"";}s:9:"key_tishi";a:1:{s:5:"about";s:27:"设置APP端的关于我们";}s:14:"key_javascript";a:1:{s:5:"about";s:0:"";}}', '2015-08-12 07:20:47');

--
-- 改变反馈表
--
ALTER TABLE `ts_feedback` CHANGE `feedback` `content` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '反馈内容';
ALTER TABLE `ts_feedback` DROP `feedbacktype`;
ALTER TABLE `ts_feedback` CHANGE `type` `type` INT(10) NULL DEFAULT NULL COMMENT '反馈类型';

DELETE FROM `ts_system_config` WHERE `list` = 'pageKey' AND `key` = 'admin_Application_feedback';

INSERT INTO `ts_system_config` (`list`, `key`, `value`, `mtime`) VALUES
('pageKey', 'admin_Application_feedback', 'a:4:{s:3:"key";a:4:{s:4:"user";s:4:"user";s:7:"content";s:7:"content";s:4:"time";s:4:"time";s:8:"doaction";s:8:"doaction";}s:8:"key_name";a:4:{s:4:"user";s:6:"用户";s:7:"content";s:12:"反馈内容";s:4:"time";s:12:"反馈时间";s:8:"doaction";s:6:"操作";}s:10:"key_hidden";a:4:{s:4:"user";s:1:"0";s:7:"content";s:1:"0";s:4:"time";s:1:"0";s:8:"doaction";s:1:"0";}s:14:"key_javascript";a:4:{s:4:"user";s:0:"";s:7:"content";s:0:"";s:4:"time";s:0:"";s:8:"doaction";s:0:"";}}', '2015-08-13 03:57:04');

DELETE FROM `ts_system_config` WHERE `list` = 'pageKey' AND `key` = 'admin_Mobile_setting';

INSERT INTO `ts_system_config` (`list`, `key`, `value`, `mtime`) VALUES
('pageKey', 'admin_Mobile_setting', 'a:6:{s:3:"key";a:1:{s:6:"switch";s:6:"switch";}s:8:"key_name";a:1:{s:6:"switch";s:9:"开关：";}s:8:"key_type";a:1:{s:6:"switch";s:5:"radio";}s:11:"key_default";a:1:{s:6:"switch";s:0:"";}s:9:"key_tishi";a:1:{s:6:"switch";s:26:"设置3G版本是否开启";}s:14:"key_javascript";a:1:{s:6:"switch";s:0:"";}}', '2015-08-13 08:07:29');