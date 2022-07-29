import { Menu } from "antd";
import { useState } from "react";
import styles from "./index.module.css";
import { Link } from "react-router-dom";

const LeftNav = () => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);

  const handleMenuOpenChange = (openKeys) => {
    setOpenKeys(openKeys);
  };
  return (
    <div className={styles.LeftNav}>
      <Menu
        theme="light"
        onOpenChange={handleMenuOpenChange}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        mode="inline"
      >
        <Menu.Item
          key="1"
          className={styles.inventory}
          style={{ lineHeight: "40px" }}
        >
          <Link to="/inventory" style={{ textDecoration: "none" }}>
            <span>盘点管理</span>
          </Link>
        </Menu.Item>
        <Menu.Item
          key="2"
          className={styles.seek}
          style={{ lineHeight: "40px" }}
        >
          <Link to="/seek" style={{ textDecoration: "none" }}>
            <span>查找管理</span>
          </Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default LeftNav;
