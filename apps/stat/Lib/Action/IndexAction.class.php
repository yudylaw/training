<?php

class IndexAction extends Action {
    
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
        
        $countSql = "SELECT count(DISTINCT uid) as total from ts_user_data 
                    where `key` in ('weiba_topic_count', 'weiba_reply_count', 'login_count')";
        
        $data = M('user_data')->query($countSql);
        $count = $data[0]['total'];
        
        $result = M('user_data')->findPageBySql($sql, $count, 20);
        
        $records = $result['data'];
        
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
        
        $this->assign("page", $result['html']);
        $this->assign('records', $records);
        $this->display();
    }
    
    //课程学习统计
    public function course() {
        
        $id = intval($_REQUEST['id']);
        
        if ($id > 0) {
            $course = M('course')->where(array('id'=>$id))->find();
            
            if (empty($course)) {
                $this->error("课程不存在");
            }
        }
        
        $sql = "select * from ts_course where is_del = 0 order by id desc limit 0,10";//最近10个课程
        $courses = M('course')->query($sql);
        
        if ($id < 1 && !empty($courses)) {
            $id = $courses[0]['id'];//取第一个课程
        }
        
        if ($id > 0) {
            
            $countSql = "SELECT count(1) as total from ts_course_learning where course_id=".$id;
            
            $data = M('course_learning')->query($countSql);
            $count = $data[0]['total'];
            
            $sql = "SELECT cl.course_id, cl.percent, cl.ctime, u.uname, u.location,u.phone";
            $sql .=" FROM ts_course_learning cl LEFT JOIN ts_user u ON cl.uid = u.uid WHERE cl.course_id=".$id;
            
            $result = M('course')->findPageBySql($sql, $count, 20);
            
            $records = $result['data'];
            $this->assign('records', $records);
            $this->assign("page", $result['html']);
        }
        
        $this->assign('courses', $courses);
        $this->assign('course_id', $id);
        
        $this->display();
    }
    
    //作业统计
    public function homework() {
        $id = intval($_REQUEST['id']);
        
        if ($id > 0) {
            $homework = M('homework')->where(array('id'=>$id, 'type'=>1, 'is_del'=>0))->find();
        
            if (empty($homework)) {
                $this->error("作业不存在");
            }
        }
        
        $sql = "select id,name from ts_homework where type = 1 and is_del = 0 order by id desc limit 0,10";//最近10个作业
        $homeworks = M('homework')->query($sql);
        
        if ($id < 1 && !empty($homeworks)) {
            $id = $homeworks[0]['id'];//取第一个
        }

        $countSql = "SELECT count(1) as total from ts_homework_record where hw_id=".$id;
        $data = M('homework_record')->query($countSql);
        $count = $data[0]['total'];
        
        $sql = "SELECT u.uname, u.location,u.phone,hr.score,hr.is_grade,hr.ctime from ts_homework_record hr";
        $sql .=" LEFT JOIN ts_user u ON hr.uid = u.uid WHERE hr.hw_id=".$id;
    
        $result = M('homework')->findPageBySql($sql, $count, 20);
        
        $records = $result['data'];
        $this->assign('records', $records);
        $this->assign("page", $result['html']);
        
        $this->assign('homeworks', $homeworks);
        $this->assign('hw_id', $id);
        $this->display();
    }
    
    //考试统计
    public function test() {
        $id = intval($_REQUEST['id']);
        
        if ($id > 0) {
            $homework = M('homework')->where(array('id'=>$id, 'type'=>0, 'is_del'=>0))->find();
        
            if (empty($homework)) {
                $this->error("考试不存在");
            }
        }
        
        $sql = "select id,name from ts_homework where type = 0 and is_del = 0 order by id desc limit 0,10";//最近10个作业
        $homeworks = M('homework')->query($sql);
        
        if ($id < 1 && !empty($homeworks)) {
            $id = $homeworks[0]['id'];//取第一个
        }
        
        $countSql = "SELECT count(1) as total from ts_homework_record where hw_id=".$id;
        $data = M('homework_record')->query($countSql);
        $count = $data[0]['total'];
        
        $sql = "SELECT u.uname, u.location,u.phone,hr.score,hr.is_grade,hr.ctime from ts_homework_record hr";
        $sql .=" LEFT JOIN ts_user u ON hr.uid = u.uid WHERE hr.hw_id=".$id;
    
        $result = M('homework')->findPageBySql($sql, $count, 20);
        
        $records = $result['data'];
        $this->assign('records', $records);
        $this->assign("page", $result['html']);
        
        $this->assign('homeworks', $homeworks);
        $this->assign('hw_id', $id);
        $this->display();
    }
    
}