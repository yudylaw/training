<?php

/**
 * 课程学习-数据模型
 * @author sjzhao
 *
 */
class CourseLearningModel extends Model {
    
    protected $tableName = 'course_learning';
    protected $error = '';
    /**
     * 添加课程学习记录
     * @param array $param
     */
    public function addCourseLearning($param) {
        $data = array();
        !empty($param['class_id']) && $data['class_id'] = $param['class_id'];
        !empty($param['uid']) && $data['uid'] = $param['uid'];
        !empty($param['course_id']) && $data['course_id'] = $param['course_id'];
        !empty($param['percent']) && $data['percent'] = $param['percent'];
        
        !empty($param['class_id']) && $map['class_id'] = $param['class_id'];
        !empty($param['uid']) && $map['uid'] = $param['uid'];
        !empty($param['course_id']) && $map['course_id'] = $param['course_id'];
        $is_exist = $this->where($map)->find();
        if(empty($is_exist)){
            $data['ctime'] = time();
            $data['start_date'] = time();
            return $this->add($data);
        }else{
            if($param['percent'] == 100){
                $toupdate['end_date'] = time();//学习完成记录完成时间
            }
            $toupdate['percent'] = $param['percent'];
            return $this->where($map)->save($toupdate);
        }
    }
    /**
     * 更新课程学习记录
     * @param array $param
     */
    public function updateCourseLearning($param){
        $data = array();
        $map['id'] = $param['course_id'];
        if(!empty($param['percent'])){
            $data['percent'] = $param['percent'];
        }
        if(!empty($param['end_date'])){
            $data['end_date'] = $param['end_date'];
        }
        if(!empty($param['is_del'])){
            $data['is_del'] = $param['is_del'];
        }
        $this->where($map)->save($data);
    }
    
    /**
     * 根据条件查询课程学习记录
     * @param array $param
     */
    public function getCourseLearningByCondition($param) {
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        !empty($param['course_id']) && $map['course_id'] = $param['course_id'];
        !empty($param['uid']) && $map['uid'] = $param['uid'];
        !empty($param['class_id']) && $map['class_id'] = $param['class_id'];
        $limit = !empty($param['limit']) ? $param['limit'] : 20;
        $result = $this->where($map)->order('ctime desc')->findPage($limit);
        return $result;
    }
    
    /**
     * 根据条件查询课程学习记录
     * @param array $param
     */
    public function getCourseLearning($param) {
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        !empty($param['course_id']) && $map['course_id'] = $param['course_id'];
        !empty($param['uid']) && $map['uid'] = $param['uid'];
        !empty($param['class_id']) && $map['class_id'] = $param['class_id'];
        $limit = !empty($param['limit']) ? $param['limit'] : 20;
        $result = $this->where($map)->order('ctime desc')->select();
        return $result;
    }
    /**
     * 动态获取课程学习记录
     */
    public function dynamicGetCourseLearning($param){
        $course_id = $param['course_id'];
        $uid = $param['uid'];
        $class_id = $param['class_id'];
        //指定课程学完的资源数
        $sql = "SELECT count(trl.resourceid) cnt from ts_course_resource_learning trl 
                LEFT JOIN ts_course_resource tcr ON trl.resourceid = tcr.id
                WHERE trl.percent = 100 and tcr.course_id = $course_id and tcr.is_del = 0
                and trl.uid = $uid and trl.classid = $class_id";
        
        //课程的资源数统计
        $courseSql = "SELECT count(tcr.id) cnt from ts_course tc 
                LEFT JOIN ts_course_resource tcr 
                ON tc.id = tcr.course_id 
                where tc.is_del = 0 AND tcr.is_del = 0 and tc.id = $course_id";
        $complete = $this->query($sql);
        $complete = $complete[0]['cnt'];
        $total = $this->query($courseSql);
        $total = $total[0]['cnt'];
        //课程进度 = 已经学完的资源数 / 课程资源总数
        $percent = round(($complete / $total) * 100);
        return $percent;
    }
    
}