import { useState } from "react";
import { Popconfirm } from "antd";

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
        await onConfirm();
        setLoading(false);
        setVisible(false);
      }}
    >
      <div onClick={() => setVisible(true)}>{children}</div>
    </Popconfirm>
  );
};

export default StatePopConfirm;
