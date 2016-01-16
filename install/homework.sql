
DROP TABLE IF EXISTS `ts_homework`;
CREATE TABLE `ts_homework` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL COMMENT '试卷或作业名称',
  `uid` int(11) NOT NULL COMMENT '创建者id',
  `ctime` int(10) NOT NULL COMMENT '创建时间',
  `type` tinyint(1) NOT NULL COMMENT '试卷：0，作业：1',
  `total_score` int(11) NOT NULL COMMENT '总分',
  `pass_score` int(11) NOT NULL COMMENT '及格分',
  `is_del` tinyint(1) NOT NULL COMMENT '正常：0，删除：1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='作业、试卷';

DROP TABLE IF EXISTS `ts_homework_answer`;
CREATE TABLE `ts_homework_answer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL COMMENT '答题者uid',
  `hw_id` int(11) NOT NULL COMMENT 'homework id',
  `qid` int(11) NOT NULL COMMENT '题目id',
  `content` varchar(500) NOT NULL COMMENT '回答内容',
  `score` int(11) NOT NULL COMMENT '回答得分',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='答题记录';

DROP TABLE IF EXISTS `ts_homework_question`;
CREATE TABLE `ts_homework_question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hw_id` int(11) NOT NULL COMMENT 'homework id',
  `name` varchar(100) NOT NULL COMMENT '题目名称',
  `score` int(11) NOT NULL COMMENT '题目分数',
  `num` int(11) NOT NULL COMMENT '题目编号',
  `answer` varchar(20) NOT NULL COMMENT '选择题答案，多选逗号分隔',
  `is_del` tinyint(1) NOT NULL COMMENT '0：正常，1：删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='考试、作业题目';

DROP TABLE IF EXISTS `ts_homework_question_item`;
CREATE TABLE `ts_homework_question_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL COMMENT '备选项名称',
  `hw_id` int(11) NOT NULL COMMENT 'homework id',
  `qid` int(11) NOT NULL COMMENT '题目id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='题目选项';

DROP TABLE IF EXISTS `ts_homework_record`;
CREATE TABLE `ts_homework_record` (
  `id` int(11) NOT NULL,
  `hw_id` int(11) NOT NULL COMMENT 'homework id',
  `uid` int(11) NOT NULL COMMENT '学员id',
  `ctime` int(10) NOT NULL COMMENT '创建时间',
  `status` tinyint(1) NOT NULL COMMENT '0：未开始，1：已完成',
  `score` int(11) NOT NULL COMMENT '总得分',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='考试、作业记录';


