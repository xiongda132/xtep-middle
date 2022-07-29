import {
  Card,
  Table,
  Dropdown,
  Button,
  Menu,
  notification,
  message,
  Input,
  Form,
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
import { matchSorter } from "match-sorter";

// import dayjs from dayjs;

const Inventory = () => {
  const [tableData, setTableData] = useState([{ EPCName: "123", time: "567" }]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const searchFormRef = useRef(null);
  const tableDataRef = useRef([]);

  const onSearch = ({ searchText }) => {
    if (searchText) {
      setTableData(matchSorter(tableData, searchText, { keys: ["EPCName"] }));
      return;
    }
    setTableData(tableDataRef.current);
  };
  const columns = [
    { title: "单号", dataIndex: "EPCName", width: "50%" },
    { title: "日期", dataIndex: "time", width: "50%" },
  ];
  const template = [
    { key: "EPCName", desc: "EPC", width: 200, required: true },
  ];

  const refreshData = useCallback(async () => {
    setTableLoading(true);
    const { data: res } = await axios.get(
      "http://192.168.50.206:8887/goods/check/getAll"
    );
    // const { data: res } = await axios.get(
    //     "http://localhost:8887/goods/check/getAll"
    //   );
    setTableLoading(false);
    if (res.code === 1) {
      const data =
        res?.data.map((v, idx) => ({
          ...v,
          id: idx + 1,
          EPCName: v,
          time: new Date(parseInt(v)).toLocaleString(),
        })) ?? [];
      setTableData(data);
      tableDataRef.current = data;
      setTotalCount(res.total);
    } else {
      notification.error({
        message: "请求数据失败",
        description: res.message,
      });
    }
  }, []);

  const handleExport = async (Id, cb) => {
    const { data: res } = await axios.get(
      `http://192.168.50.206:8887/goods/check/out?fileName=${Id}`
    );
    // const { data: res } = await axios.get(
    //     `http://localhost:8887/goods/check/out?fileName=${Id}`
    //   );
    const { data } = res;
    const newData = data.split("\r\n").map((item) => ({ EPCName: item }));
    if (res.code === 1) {
      XlsxWorker.downExcel(
        {
          data: newData,
          template: template,
          hasPromptTitle: true,
        },
        `EPC数据`
      );
      message.success("导出成功");
      cb();
    } else {
      notification.error({
        message: "导出失败",
        description: res.message,
      });
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

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
          <div>盘点管理</div>
          <Button
            disabled={selectedRowKeys.length !== 1}
            type="primay"
            onClick={() =>
              handleExport(selectedRowKeys[0], () => {
                refreshData();
                setSelectedRowKeys([]);
              })
            }
          >
            导出
          </Button>
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
        <Form
          ref={(r) => (searchFormRef.current = r)}
          name="search_form"
          layout="inline"
          onFinish={onSearch}
        >
          <Form.Item name="searchText">
            <Input placeholder="请输入单号" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              onClick={() => {
                searchFormRef.current.resetFields();
                setTableData(tableDataRef.current);
              }}
            >
              重置
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: "20px" }}>
          <Table
            columns={columns}
            dataSource={tableData}
            bordered
            rowSelection={{
              type: "checkbox",
              selectedRowKeys,
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedRowKeys(selectedRowKeys);
                setSelectedRows(selectedRows);
              },
            }}
            rowKey="EPCName"
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

export default Inventory;
