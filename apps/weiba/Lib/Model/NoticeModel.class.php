<?php
/**
 * 班级模型 - 数据对象模型--通知公告
 * @author jason <yangjs17@yeah.net> 
 * @version TS3.0
 */
class NoticeModel extends Model {

	protected $tableName = 'notice';
	protected $error = '';
	protected $fields = array(
							0 =>'id',1=>'weiba_id',2=>'post_uid',3=>'title',4=>'content',5=>'post_time',
							6=>'reply_count',7=>'read_count',8=>'last_reply_uid',9=>'last_reply_time',10=>'digest',11=>'top',12=>'lock',
							13=>'api_key',14=>'domain',15=>'is_index',16=>'index_img',17=>'reg_ip',
							18=>'is_del',19=>'feed_id',20=>'reply_all_count',21=>'attach',22=>'form',23=>'top_time',24=>'is_index_time','_autoinc'=>true,'_pk'=>'post_id'
						);
    /*
     * 根据班级id获取通知列表
     */
	public function getList($param) {
	    $map = array();
	    //教师角色只能看到未删除的通知
	    if(isset($param['group_id']) && $param['group_id'] == 3){
	        $map['is_del'] = 0;
	    }
	    isset($param['limit']) ? $limit = $param['limit'] : 10;
	    isset($param['weiba_id']) && $map['weiba_id'] = $param['weiba_id'];
	    return $this->where($map)->order('post_time desc')->findPage($limit);
	}
}