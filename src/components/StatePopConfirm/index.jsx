import { useState } from "react";
import { Popconfirm, notification } from "antd";

const StatePopConfirm = ({ children, onConfirm, ...restProps }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Popconfirm
      {...restProps}
      visible={visible}
      okButtonProps={{ loading: loading }}
      onCancel={() => setVisible(false)}
      onConfirm={async () => {
        setLoading(true);
        try {
          await onConfirm();
        } catch (e) {
          notification.error({
            message: "失败",
            description: "删除数据失败",
          });
          setLoading(false);
          setVisible(false);
        }
        setLoading(false);
        setVisible(false);
      }}
    >
      <div onClick={() => setVisible(true)}>{children}</div>
    </Popconfirm>
  );
};

export default StatePopConfirm;
