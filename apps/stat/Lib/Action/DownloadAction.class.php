<?php

class DownloadAction extends Action {
    
    /**
     * 平台使用统计
     */
    public function index() {
        //统计登录次数, 发帖次数, 回帖次数
        $sql = "SELECT stat.uid, stat.uname, stat.location, stat.phone, stat.sex, stat.value,
                MAX(stat.topic_count) topic_count, MAX(stat.reply_count) reply_count, MAX(stat.login_count) login_count FROM (
                SELECT ud.uid, u.uname, u.location, u.phone, u.sex, ud.value,
                CASE ud.key WHEN 'weiba_topic_count' THEN ud.value END AS topic_count,
                CASE ud.key WHEN 'weiba_reply_count' THEN ud.value END AS reply_count,
                CASE ud.key WHEN 'login_count' THEN ud.value END AS login_count
                FROM ts_user_data ud LEFT JOIN ts_user u ON ud.uid = u.uid
                WHERE ud.key in ('weiba_topic_count', 'weiba_reply_count', 'login_count')
                ) AS stat GROUP BY stat.uid";
        $records = M('user_data')->query($sql); //TODO 分页
    
        $sql = "SELECT
                SUM(CASE ud.key WHEN 'weiba_topic_count' THEN ud.value END) AS topic_count,
                SUM(CASE ud.key WHEN 'weiba_reply_count' THEN ud.value END) AS reply_count,
                SUM(CASE ud.key WHEN 'login_count' THEN ud.value END) AS login_count
                FROM ts_user_data ud
                WHERE ud.key in ('weiba_topic_count', 'weiba_reply_count', 'login_count')";
    
        $total = M('user_data')->query($sql);
        if (!empty($total)) {
            $stat = $total[0];
            $this->assign('stat', $stat);
        }
    
        $this->assign('records', $records);
        $this->assign('filename', '平台使用统计.xls');
        $this->display();
    }
    
    /**
     * 考试学情下载
     */
    public function test() {
        $id = intval($_REQUEST['id']);
        $classid = intval($_REQUEST['classid']);
        
        $homework = M('homework')->where(array('id'=>$id, 'type'=>0, 'is_del'=>0))->find();
    
        if (empty($homework)) {
            $this->error("考试不存在");
        }
        
        $class = M('weiba')->where(array('weiba_id'=>$classid))->find();
        
        if (empty($class)) {
            $this->error("班级不存在");
        }
        
        $sql = "SELECT u.uname, u.location,u.phone,hr.score,hr.is_grade,hr.ctime from ts_homework_record hr";
        $sql .=" LEFT JOIN ts_user u ON hr.uid = u.uid WHERE hr.hw_id=".$id;
        
        if ($classid > 0) {
            $sql .=" AND hr.class_id=".$classid;
        }
    
        $records = M('homework')->query($sql);
        $this->assign('records', $records);
        $this->assign('filename', $homework['name'].'--'.$class['weiba_name'].'.xls');
        $this->display();
    }
    
    /**
     * 作业学情下载
     */
    public function homework() {
        $id = intval($_REQUEST['id']);
        $classid = intval($_REQUEST['classid']);
    
        $homework = M('homework')->where(array('id'=>$id, 'type'=>1, 'is_del'=>0))->find();
    
        if (empty($homework)) {
            $this->error("作业不存在");
        }
        
        $class = M('weiba')->where(array('weiba_id'=>$classid))->find();
        
        if (empty($class)) {
            $this->error("班级不存在");
        }
    
        $sql = "SELECT u.uname, u.location,u.phone,hr.score,hr.is_grade,hr.ctime from ts_homework_record hr";
        $sql .=" LEFT JOIN ts_user u ON hr.uid = u.uid WHERE hr.hw_id=".$id;
        
        if ($classid > 0) {
            $sql .=" AND hr.class_id=".$classid;
        }
    
        $records = M('homework')->query($sql);
        $this->assign('records', $records);
        $this->assign('filename', $homework['name'].'--'.$class['weiba_name'].'.xls');
        $this->display();
    }
    
    //课程学习统计
    public function course() {
    
        $id = intval($_REQUEST['id']);
        $classid = intval($_REQUEST['classid']);
    
        $course = M('course')->where(array('id'=>$id))->find();

        if (empty($course)) {
            $this->error("课程不存在");
        }
    
        $class = M('weiba')->where(array('weiba_id'=>$classid))->find();
        
        if (empty($class)) {
            $this->error("班级不存在");
        }
        
        $sql = "SELECT cl.course_id, cl.percent, cl.ctime, u.uname, u.location,u.phone";
        $sql .=" FROM ts_course_learning cl LEFT JOIN ts_user u ON cl.uid = u.uid WHERE cl.course_id=".$id;
        
        if ($classid > 0) {
            $sql .=" AND cl.class_id=".$classid;
        }

        $records = M('course')->query($sql);
        $this->assign('records', $records);
        $this->assign('filename', $course['title'].'--'.$class['weiba_name'].'.xls');
        $this->display();
    }
    
}