<?php

/**
 * 课程-数据模型
 * @author sjzhao
 *
 */
class CourseModel extends Model {
    
    protected $tableName = 'course';
    protected $error = '';
    /**
     * 根据条件查询课程
     * @param array $param
     */
    public function getCourseByCondition($param) {
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        if (!empty($param['title'])){
            $map['title'] = array('like','%'.$param['title'].'%');
        }
        if(!empty($param['id'])){
            $map['id'] = $param['id'];
        }
        $result = $this->where($map)->findAll();
        return $result;
    }
    /**
     * 创建课程
     * @param array $param
     */
    public function addCourse($param){
        $data = array();
        $data['title'] = $param['title'];
        $data['creator'] = $param['creator'];
        $data['subject'] = $param['subject'];
        $data['required'] = $param['required'];
        $data['course_hour'] = $param['course_hour'];
        $data['course_score'] = $param['course_score'];
        $data['description'] = $param['description'];
        $data['ctime'] = time();
        return $this->add($param);
    }
    /**
     * 更新课程
     * @param array $param
     */
    public function updateCourse($param) {
        $map['id'] = $param['id'];
        if(!empty($param['title'])){
            $data['title'] = $param['title'];
        }
        if(!empty($param['creator'])){
            $data['creator'] = $param['creator'];
        }
        if(!empty($param['subject'])){
            $data['subject'] = $param['subject'];
        }
        if(!empty($param['is_del'])){
            $data['is_del'] = $param['is_del'];
        }
        if(!empty($param['start_date'])){
            $data['start_date'] = $param['start_date'];
        }
        if(!empty($param['end_date'])){
            $data['end_date'] = $param['end_date'];
        }
        if(isset($param['status'])){
            $data['status'] = $param['status'];
        }
        //删除课程资源
        if(!empty($param['resourceid'])){
            $map2['id'] = array("IN",array($param['resourceid']));
            M('CourseResource')->where($map2)->save(array('is_del'=>1));
        }
        return $this->where($map)->save($data);
    }
    
    public function getCourseList($param){
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        $page = !empty($param['page']) ? $param['page'] : 1;
        $limit = !empty($param['limit']) ? $param['limit'] : 20;
        //教师只展示开始的课程，不展示结束课程
        if(isset($param['group_id']) && $param['group_id'] ==Role::TEACHER){
            $map['status'] = 1;
        }
        if(in_array($param['group_id'],array(Role::TEACHER))){//教师只展示分配到本班级的课程
            //$where['classid'] = array('IN',$param['class']);
            $where['classid'] = $param['class_id'];
            $where['is_del'] = 0;//只查询未删除课程安排
            $course_assign = D('CourseAssign')->where($where)->findAll();
            $course_ids = array();
            foreach ($course_assign as $val){
                array_push($course_ids,$val['courseid']);
            }
            $map['id'] = array('IN',$course_ids);
        }
        $result = $this->where($map)->order('ctime desc')->findPage($limit);
        $resdata = $result['data'];
        $courselearningmodel = model('CourseLearning');
        foreach ($resdata as &$value){
//             $courselearning = $courselearningmodel->getCourseLearning(array('course_id'=>$value['id'],'uid'=>$param['uid'],'class_id'=>$param['class_id']));
//             if(!empty($courselearning)){
//                 //$result['data'][$key]['start_date'] = $courselearning['start_date'];
//                 //$result['data'][$key]['end_date'] = $courselearning['end_date'];
//                 //$value['percent'] = $courselearning[0]['percent'];
//             }else{
//                 $value['percent'] = 0;
//             }
               //采用动态获取学习记录的方法
               $value['percent'] = $courselearningmodel->dynamicGetCourseLearning(array('course_id'=>$value['id'],'uid'=>$param['uid'],'class_id'=>$param['class_id']));
        }
        $result['data'] = $resdata;
        return $result;
    }
}