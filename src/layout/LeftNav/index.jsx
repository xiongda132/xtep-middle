import { Menu } from "antd";
import { useState } from "react";
import styles from "./index.module.css";
import { Link, withRouter } from "react-router-dom";
import { BarChartOutlined, AppstoreOutlined } from "@ant-design/icons";
const LeftNav = (props) => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);

  const items = [
    { label: "盘点管理", key: "inventory", icon: <BarChartOutlined /> },
    { label: "查找导出", key: "seek", icon: <AppstoreOutlined /> },
  ];
  const onClick = (e) => {
    switch (e.key) {
      case "inventory":
        return props.history.push("/inventory");
      case "seek":
        return props.history.push("/seek");
      default:
        return;
    }
  };

  return (
    <div className={styles.LeftNav}>
      <Menu
        onClick={onClick}
        theme="light"
        defaultSelectedKeys={["inventory"]}
        openKeys={openKeys}
        mode="inline"
        items={items}
      ></Menu>
    </div>
  );
};

export default withRouter(LeftNav);
