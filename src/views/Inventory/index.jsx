import { Card, Table, Button, notification, message, Space } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import XlsxWorker from "xlsx-worker";
import axios from "axios";
import { StatePopConfirm } from "../../components";

const Inventory = () => {
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const tableDataRef = useRef([]);
  const columns = [
    { title: "单号", dataIndex: "EPCName", width: "50%" },
    { title: "日期", dataIndex: "time", width: "50%" },
  ];
  const template = [
    { key: "EPCName", desc: "EPC", width: 200, required: true },
  ];

  const refreshData = useCallback(async () => {
    setTableLoading(true);
    try {
      const { data: res } = await axios.get(
        "/goods/check/getAll"
      );
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
      } else {
        notification.error({
          message: "请求数据失败",
          description: res.message,
        });
      }
    } catch (e) {
      setTableLoading(false);
      notification.error({
        message: "失败",
        description: "请求数据错误",
      });
    }
  }, []);

  const handleExport = async (Id, cb) => {
    const { data: res } = await axios.get(
      `/goods/check/out?fileName=${Id}`
    );
    const { data } = res;
    const newData = data?.map((item) => ({ EPCName: item })) || [];
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

  const delConfirm = async (id, cb) => {
    const { data: res } = await axios.post(
      "/goods/check/delete",
      id
    );
    if (res.code === 1) {
      message.success("删除用户成功");
      cb();
    } else {
      notification.error({
        message: "删除用户失败",
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
          <Space>
            <StatePopConfirm
              title="确认删除吗？"
              onConfirm={delConfirm.bind(null, selectedRowKeys, () => {
                refreshData();
                setSelectedRowKeys([]);
              })}
              okText="删除"
              cancelText="取消"
            >
              <Button disabled={!selectedRowKeys.length} type="primary" danger>
                删除
              </Button>
            </StatePopConfirm>
            <Button
              disabled={selectedRowKeys.length !== 1}
              type="primary"
              onClick={() =>
                handleExport(selectedRowKeys[0], () => {
                  refreshData();
                  setSelectedRowKeys([]);
                })
              }
            >
              导出
            </Button>
          </Space>
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
            loading={tableLoading}
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
