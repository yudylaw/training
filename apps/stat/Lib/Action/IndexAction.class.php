<?php

class IndexAction extends Action {
    
    /**
     * 平台使用统计
     */
    public function index() {
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
            $sql = "SELECT cl.course_id, cl.percent, cl.ctime, u.uname, u.location,u.phone";
            $sql .=" FROM ts_course_learning cl LEFT JOIN ts_user u ON cl.uid = u.uid WHERE cl.course_id=".$id;
            
            $records = M('course')->query($sql);
            $this->assign('records', $records);
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
        
        if ($id > 0) {
            $sql = "SELECT u.uname, u.location,u.phone,hr.score,hr.is_grade,hr.ctime from ts_homework_record hr";
            $sql .=" LEFT JOIN ts_user u ON hr.uid = u.uid WHERE hr.hw_id=".$id;
        
            $records = M('homework')->query($sql);
            $this->assign('records', $records);
        }
        
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
        
        if ($id > 0) {
            $sql = "SELECT u.uname, u.location,u.phone,hr.score,hr.is_grade,hr.ctime from ts_homework_record hr";
            $sql .=" LEFT JOIN ts_user u ON hr.uid = u.uid WHERE hr.hw_id=".$id;
        
            $records = M('homework')->query($sql);
            $this->assign('records', $records);
        }
        
        $this->assign('homeworks', $homeworks);
        $this->assign('hw_id', $id);
        $this->display();
    }
    
}