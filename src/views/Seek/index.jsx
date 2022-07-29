import {
  Card,
  Table,
  Dropdown,
  Button,
  Menu,
  notification,
  message,
} from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  DownOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import UploadDialog from "../../components/UploadDialog";
import XlsxWorker from "xlsx-worker";
import axios from "axios";

const Seek = () => {
  const columns = [{ title: "EPC", dataIndex: "EPCName" }];
  const [tableData, setTableData] = useState([{ EPCName: "123456789" }]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const template = [
    { key: "EPCName", desc: "EPC", width: 200, required: true },
  ];

  const refreshData = useCallback(async () => {
    setTableLoading(true);
    const { data: res } = await axios.get(
      "http://192.168.50.206:8887/goods/select/out"
    );
    // const { data: res } = await axios.get(
    //     "http://localhost:8887/goods/select/out"
    //   );
    setTableLoading(false);
    if (res.code === 1) {
      const data =
        res?.data.map((v, idx) => ({ ...v, id: idx + 1, EPCName: v })) ?? [];
      setTableData(data);
      setTotalCount(res.total);
    } else {
      notification.error({
        message: "请求数据失败",
        description: res.message,
      });
    }
  }, []);

  const handleImportData = useCallback(async (data, modelValue, callback) => {
    const newData = data.map((item) => item.EPCName);
    const { data: res } = await axios.post(
      "http://192.168.50.206:8887/goods/select/in",
      newData
    );
    // const { data: res } = await axios.post(
    //   "http://localhost:8887/goods/select/in",
    //   newData
    // );
    if (res.code === 1) {
      callback();
      refreshData();
      notification.success({
        message: "数据导入成功",
      });
    } else {
      notification.error({
        message: "数据导入失败",
        description: res.message,
      });
    }
  }, []);

  const handleMenuClick = async (e) => {
    switch (e.key) {
      case "1":
        XlsxWorker.downExcel(
          {
            data: [],
            template: template,
            hasPromptTitle: true,
          },
          `商品数据导入模板`
        );
        return;
      case "2":
        setUploadModalVisible(true);
        return;
      default:
        return;
    }
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        {
          label: "下载导入模板",
          key: "1",
          icon: <DownloadOutlined />,
        },
        {
          label: "导入数据",
          key: "2",
          icon: <UploadOutlined />,
        },
      ]}
    />
  );

  return (
    <div>
      <Card bodyStyle={{ padding: "18px", backgroundColor: "white" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>查找管理</div>
          <Dropdown overlay={menu}>
            <Button type="primay">导入/导出</Button>
          </Dropdown>
          <UploadDialog
            open={uploadModalVisible}
            closeDialog={() => setUploadModalVisible(false)}
            getImportData={handleImportData}
            template={template}
          />
        </div>
      </Card>
      <Card
        style={{ marginTop: "20px" }}
        bodyStyle={{
          padding: "18px",
          backgroundColor: "white",
          marginTop: "20px",
        }}
      >
        <div>
          <Table
            columns={columns}
            dataSource={tableData}
            bordered
            pagination={{
              total: tableData.length,
              showTotal: (total) => `共${total}条数据`,
              showQuickJumper: true,
              showSizeChanger: true,
            }}
          ></Table>
        </div>
      </Card>
    </div>
  );
};

export default Seek;
