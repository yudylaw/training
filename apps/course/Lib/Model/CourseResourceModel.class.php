<?php

/**
 * 课程资源-数据模型
 * @author sjzhao
 *
 */
class CourseResourceModel extends Model {
    
    protected $tableName = 'course_resource';
    protected $error = '';
    /**
     * 增加课程资源
     */
    public function addCourseResource($param){
        $data = array();
        $data['title'] = $param['title'];
        $data['utime'] = time();
        $data['ext'] = "ext";
        $data['description'] = $param['description'];
        $data['course_id'] = $param['course_id'];
        $data['save_path'] = $param['save_path'];
        //echo json_encode($data);die;
        return $this->add($data);
    }
    /**
     * 根据条件获取资源
     * @param array $param
     */
    public function getResourceByCondition($param) {
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        $map['course_id'] = $param['course_id'];
        if (!empty($param['description'])){
            $map['description'] = array('like','%'.$param['description'].'%');
        }
        $page = !empty($param['page']) ? $param['page'] : 1;
        $limit = !empty($param['limit']) ? $param['limit'] : 10;
        $result = $this->where($map)->page($page,$limit)->select();
        return $result;
    }
}