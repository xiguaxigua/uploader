import { Button, message, Tag, Tooltip } from "antd";
import { format } from "fecha";
import numerify from "numerify";
import numerifyBytes from "numerify/lib/plugins/bytes.umd.js";
import copy from "copy-to-clipboard";
import { CopyOutlined, LinkOutlined } from "@ant-design/icons";

numerify.register("bytes", numerifyBytes);

export const STORE_KEY = "izeral-upload";

export const COLUMNS: any = [
  {
    title: "缩略图",
    dataIndex: "pic",
    width: 70,
    key: "pic",
    render: (_, row) => (
      <img
        src={
          /\.(png|jpg|gif|bmp|svg)$/i.test(row.url)
            ? row.url
            : "https://cdn.jsdelivr.net/npm/picture-bed-xigua@2021.12.18-185635-4/file.png"
        }
        style={{
          maxWidth: "28px",
          maxHeight: "28px",
          margin: "0 auto",
        }}
      />
    ),
  },
  {
    title: "文件名",
    dataIndex: "name",
    width: 100,
    key: "name",
    render: (name) => (
      <Tooltip title={name}>
        <span className="one-line name" style={{ width: "100px" }}>
          {name}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "地址",
    dataIndex: "url",
    key: "url",
    width: 130,
    render: (url) => (
      <Tooltip title={url}>
        <span className="one-line url" style={{ width: "130px" }}>
          {url}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "大小",
    dataIndex: "size",
    key: "size",
    width: 100,
    align: "center",
    render: (size) => <Tag color="magenta">{numerify(size, "0.0 b")}</Tag>,
  },
  {
    title: "时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 200,
    align: "center",
    render: (createdAt) => (
      <span>{format(new Date(createdAt), "YYYY-MM-DD HH:mm:ss")}</span>
    ),
  },
  {
    title: "操作",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 90,
    align: "center",
    render: (_, row) => (
      <div className="operate-box">
        <Tooltip title="新标签页打开">
          <Button
            shape="circle"
            icon={<LinkOutlined />}
            size="small"
            type="ghost"
            onClick={() => {
              window.open(row.url, "_blank");
            }}
          />
        </Tooltip>
        <Tooltip title="复制链接地址">
          <Button
            shape="circle"
            icon={<CopyOutlined />}
            size="small"
            type="ghost"
            onClick={() => {
              copy(row.url);
              message.success("复制成功");
            }}
          />
        </Tooltip>
      </div>
    ),
  },
];
