<?php

class IndexAction extends Action {

    public function classroom_list() {
        $followList = M('weiba_follow')->where(array('follower_uid'=>$this->mid))->findAll();
        
        $classroomIds = array();
        
        foreach ($followList as $follow) {
            array_push($classroomIds, $follow['weiba_id']);
        }
        
//         $classroomList = M('weiba')->where(array('weiba_id'=>array('IN', $classroomIds), 'is_del'=>0))->findAll();
        
        $ids = implode(',', $classroomIds);
        
        $sql = "SELECT w.weiba_name, w.weiba_id, w.ctime, w.cid, w.follower_count, u.uname ";
        $sql .="FROM ts_weiba w LEFT JOIN ts_user u ON w.admin_uid = u.uid WHERE w.is_del = 0 AND weiba_id IN (".$ids.")";
        
        $classroomList = M('weiba')->query($sql);
        
        $this->assign('classroomList', $classroomList);
        $this->display();
    }
    
    public function member_list() {
        $class_id = intval($_REQUEST['class_id']);
        $classroom = M('weiba')->where(array('weiba_id'=>$class_id, 'is_del'=>0))->find();
    
        if(empty($classroom)) {
            $this->error("班级不存在");
        }
    
        $sql = "SELECT wf.*, u.uname, u.location, u.phone, u.sex from ts_weiba_follow wf LEFT JOIN ts_user u ON wf.follower_uid = u.uid";
        $sql .=" WHERE wf.weiba_id = ".$class_id;
        $members = M('weiba_follow')->query($sql);
    
        $this->assign('classroom', $classroom);
        $this->assign('members', $members);
        $this->display();
    }
    
}