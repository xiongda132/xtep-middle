import React, { useState, useRef, useMemo } from "react";
import {
  Modal,
  Button,
  Steps,
  Spin,
  Select,
  Tooltip,
  notification,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import styles from "./UploadDialog.module.css";
import dayjs from "dayjs";
import XlsxWorker from "xlsx-worker";
import { QuestionCircleOutlined } from "@ant-design/icons";


const { Step } = Steps;

const UploadDialog = ({
  checkMethods = () => ({ code: 1 }),
  open,
  closeDialog,
  getImportData,
  template,
}) => {
  const [current, setCurrent] = useState(null);
  const [status, setStatus] = useState("wait"); // wait process finish error
  const [resultActionBtn, setResultActionBtn] = useState(null);
  const [isUploading, setIsUploading] = useState(true);
  const [confirmBtnStatus] = useState(false);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [modelValue, setModelValue] = useState("all");
  const dataReadyForUpload = useRef([]);

  const xlsxWorker = useMemo(() => new XlsxWorker(), []);

  const handleStart = async () => {
    setCurrent(0);
    setStatus("process");
    setIsProcessingExcel(true);
    analysisUploadFile(async (value, files) => {
      const fileSizeWithMb = files.size / 1000000;
      if (fileSizeWithMb < 10) {
        let result = await xlsxWorker.analysisBuffer(template, value);
        afterImportSuccess(result);
      } else {
        notification.error({
          message: "文件大小超出限制，请检查上传文件大小",
          description: "文件大小最大不能超过10M",
        });
      }
    });
  };

  const analysisUploadFile = (
    callback = (value, files) => console.log(value, files)
  ) => {
    let inputDom = document.createElement("input");
    inputDom.setAttribute("type", "file");
    inputDom.setAttribute("accept", ".xlsx");
    inputDom.addEventListener("change", (e) => {
      const inputDom = e.target;
      const reader = new FileReader();
      reader.onload = () => {
        // console.log("inputDom.files[0]", inputDom.files[0].name);
        callback(reader.result, inputDom.files[0]);
        inputDom.value = "";
      };
      reader.readAsArrayBuffer(inputDom.files[0]);
    });
    inputDom.click();
  };

  const handleReset = () => {
    setCurrent(0);
    setStatus("error");
    setIsUploading(true);
    setIsProcessingExcel(false);
    dataReadyForUpload.current = [];
    setModelValue("all");
  };

  const handleConfirm = async () => {
    await getImportData(dataReadyForUpload.current, modelValue, () => {
      closeDialog();
      handleReset();
    });
  };

  const afterImportSuccess = async (sheets) => {
    setIsProcessingExcel(false);
    setIsUploading(false);
    if (sheets.eventId === "upload") {
      setCurrent(1);
      setResultActionBtn(null);
      setIsProcessingExcel(true);
      setStatus("process");
      await setTimeout(() => {}, 5000);
      console.log("sheets.data", sheets.data);
      const res = await checkMethods(sheets.data);
      console.log("res", res);
      if (res.code === 1) {
        setCurrent(3);
        setResultActionBtn(null);
        setIsProcessingExcel(false);
        setStatus("finish");
        dataReadyForUpload.current = sheets.data;
      } else {
        setStatus("error");
        setIsProcessingExcel(false);
        setResultActionBtn(
          <Button
            onClick={async () => {
            }}
          >
            下载数据验证结果
          </Button>
        );
      }
    } else {
      setStatus("error");
      setResultActionBtn(
        <Button
        onClick={async () => await xlsxWorker.downErrTemplate("模板匹配结果")}
        >
          下载模板匹配结果
        </Button>
      );
    }
  };

  return (
    <Modal
      width={"1000px"}
      footer={[
        <div style={{ display: "none", float: "left" }}>
          <span>导入模式：</span>
          <Select
            onChange={(value) => {
              setModelValue(value);
            }}
            value={modelValue}
          >
            <Select.Option value="all">全量导入</Select.Option>
            <Select.Option value="add">增量导入</Select.Option>
          </Select>
          <Tooltip
            title={
              <span>
                全量导入：清空原有信息，将当前文件数据添加入库;增量导入：覆盖导入，如果编号相同会覆盖原有信息，其余的增量添加入库；
              </span>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: "5px" }} />
          </Tooltip>
        </div>,
        <Button key="0" onClick={handleReset}>
          重新上传
        </Button>,
        <Button key="1" onClick={closeDialog}>
          取消
        </Button>,
        <Button
          loading={confirmBtnStatus}
          disabled={current !== 3}
          key="2"
          type="primary"
          onClick={handleConfirm}
        >
          开始上传
        </Button>,
      ]}
      closeIcon={<CloseOutlined style={{ color: "#fff" }} />}
      title={
        <span
          style={{
            fontSize: 16,
            color: "#fff",
          }}
        >
          上传
        </span>
      }
      visible={open}
      onOk={handleConfirm}
      onCancel={closeDialog}
    >
      <Steps current={current} status={status}>
        <Step title="解析模板" description="验证传入模板是否符合要求" />
        <Step title="解析数据" description="验证待上传数据格式是否有误" />
        <Step title="确认上传" description="验证完成，确认上传" />
      </Steps>
      {isProcessingExcel ? (
        <div className={styles.actionArea}>
          <Spin />
          <div>解析数据中...</div>
        </div>
      ) : (
        <div>
          {current === 3 ? (
            <div className={styles.actionArea}>校验已完成，请点击开始上传</div>
          ) : isUploading ? (
            <div className={styles.inputfile} onClick={handleStart}>
              <span className={styles.inputfileDescText}>
                请选择要上传的EPC文件
              </span>
            </div>
          ) : (
            <div className={styles.actionArea}>
              <div>{resultActionBtn ? "解析完成" : "解析中..."} </div>
              <div>{resultActionBtn}</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default UploadDialog;
