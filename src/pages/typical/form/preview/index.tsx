import React from 'react'
import classnames from 'classnames'
import { Space, Form, Button, Icon, Collapse, Row, Col, Input, Layout, Radio, Upload } from '@kdcloudjs/kdesign'
import E from 'wangeditor'
import { getFormPreview } from '@/services/form'

import formStyles from '../index.less'
import styles from './index.less'

interface DataProps {
  id?: number
  title?: string
  desc?: string
  image?: string
  author?: string
  describe?: string
}

const { Sider, Content } = Layout

function getBase64(img: any, callback: any) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

function beforeUpload(file: any) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    console.error('You can only upload JPG/PNG file!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    console.error('Image must smaller than 2MB!')
  }
  return isJpgOrPng && isLt2M
}

const ArticleForm = (props: any) => {
  const { article, data, content, changeData } = props

  const [value, setValue] = React.useState(data.find((item: any) => item.id === article)?.image)
  const [formData, setFormData] = React.useState<DataProps>({})
  const [loading, setLoading] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState('')

  React.useEffect(() => {
    setValue(data.find((item: any) => item.id === article)?.image)
    setFormData(data.find((item: any) => item.id === article) || {})
  }, [article, data])

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      setImageUrl('')
    } else if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (imageUrl: string) => {
        setLoading(false)
        setImageUrl(imageUrl)
      })
    }
  }

  const handleOnChange = (value: string, key: keyof DataProps) => {
    changeData(key, value)
  }

  const uploadButton = (
    <div>
      {loading ? (
        <Icon type="loadding-circle" spin />
      ) : (
        <Icon type="add" style={{ fontSize: 16, color: '#666', fontWeight: 'bolder' }} />
      )}
      <div>??????????????????</div>
    </div>
  )

  return (
    <>
      <Row gutter={[80, 22]} className={formStyles.row}>
        <Col span={8}>
          <Form.Item required label="??????" name="title" validateTrigger="onBlur">
            <Input value={formData?.title} onChange={(e) => handleOnChange(e.target.value, 'title')} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="??????" name="author" defaultValue="9724811212" validateTrigger="onBlur">
            <Input value={formData?.author} onChange={(e) => handleOnChange(e.target.value, 'author')} />
          </Form.Item>
        </Col>
        <Col span={8}></Col>
        <Col span={8}>
          <Form.Item label="??????" name="desc" required defaultValue="?????????????????????" validateTrigger="onBlur">
            <Input value={formData?.desc} onChange={(e) => handleOnChange(e.target.value, 'desc')} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="???????????????" name="background" required>
            <Radio.Group
              className={styles.selectBg}
              value={value}
              onChange={(e) => {
                handleOnChange(e.target.value, 'image')
                setValue(e.target.value)
              }}
            >
              {[1, 2, 3, 4].map((item) => (
                <Radio key={item} value={item}>
                  <img src={require(`../../../../assets/images/bg_0${item}.png`)} />
                </Radio>
              ))}
              <Radio value="customer">
                <Upload
                  name="avatar"
                  listType="picture"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                  style={{ display: 'inline-block' }}
                >
                  {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                </Upload>
              </Radio>
            </Radio.Group>
          </Form.Item>
          <span className={styles.describe}>???????????????461*461?????????JPG???PNG????????????????????????2M</span>
        </Col>
        <Col span={24}>
          <Form.Item label={<span className={styles.text}>??????</span>} name="body">
            <div className={styles.editor} id="wang-editor" />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}

export default function (props: any) {
  const [form] = Form.useForm()

  const [article, setArticle] = React.useState(1)
  const [data, setData] = React.useState<DataProps[]>([])

  async function init() {
    const data = await getFormPreview()
    const { previewData } = data
    setData(previewData)
  }

  React.useEffect(() => {
    init()
    const editor = new E('#wang-editor')
    editor.config.menus = [
      'bold',
      'fontSize',
      'fontName',
      'italic',
      'underline',
      'strikeThrough',
      'indent',
      'lineHeight',
      'foreColor',
      'backColor',
      'justify',
    ]
    editor.create()
    return () => {
      editor.destroy()
    }
  }, [])

  const handleSelectArticle = setArticle

  const handleDel = () => {
    const curData: DataProps[] = data.filter((_item, index) => index !== article - 1)
    setData(curData)
    if (curData.length) {
      setArticle(curData[0].id)
    }
  }

  const handleAdd = () => {
    const copyData = [...data]
    let addData = copyData.find((item) => item.id === article)
    if (addData) {
      addData = { ...addData, id: data.length + 1 }
      setData([...copyData, addData])
    }
  }

  const handleMove = (type: string) => {
    const copyData = [...data]
    let indx = copyData.findIndex((item) => item.id === article)
    if (type === 'up' && indx > 0) {
      copyData[indx] = copyData.splice(indx - 1, 1, copyData[indx])[0]
      setData(copyData)
    }

    if (type === 'down' && indx < data.length - 1) {
      copyData[indx] = copyData.splice(indx + 1, 1, copyData[indx])[0]
      setData(copyData)
    }
  }

  const changeData = (key: string, value: string) => {
    const indx = data.findIndex((item) => item.id === article)
    const copyData = [...data]
    copyData[indx][key] = value
    setData(copyData)
  }

  return (
    <Form className={formStyles.form} form={form} labelWidth={100}>
      <Space className={formStyles.operation} size={12}>
        <Button type="primary" htmlType="submit">
          ??????
        </Button>
        <Button type="primary">??????</Button>
      </Space>

      <Collapse className={formStyles.collapse} defaultActiveKey={['basic']}>
        <Collapse.Panel header={'????????????????????????'} panelKey="basic">
          <Row gutter={[80, 22]} className={formStyles.row}>
            <Col span={6}>
              <Form.Item required label="??????????????????" name="unit" defaultValue="?????????" validateTrigger="onBlur">
                <Input suffix={<Icon type="search" />} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="????????????" name="module" required defaultValue="???????????????" validateTrigger="onBlur">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="????????????" name="code" required defaultValue="9724811212" validateTrigger="onBlur">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="????????????" name="name" required defaultValue="9724811212" validateTrigger="onBlur">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="????????????" name="describe" validateTrigger="onBlur">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Collapse.Panel>
      </Collapse>
      <Layout className={styles.article}>
        <Sider className={styles.catalog} width={336}>
          <h3>????????????</h3>
          <Space className={styles.operation} split={<span className={formStyles.split}></span>} size={16}>
            <Button type="text" onClick={handleAdd}>
              ??????
            </Button>
            <Button type="text" onClick={() => handleMove('up')}>
              ??????
            </Button>
            <Button type="text" onClick={() => handleMove('down')}>
              ??????
            </Button>
            <Button type="text" onClick={handleDel}>
              ??????
            </Button>
          </Space>
          <ul className={styles.list}>
            {data.map(({ title, desc, image, id }, index) => (
              <li
                key={index}
                className={classnames({ [styles.active]: article === id })}
                onClick={handleSelectArticle.bind(null, id)}
              >
                <img src={require(`../../../../assets/images/card_0${image}.png`)} alt="bg" />
                <div className={styles.desc}>
                  <h4 title={title}>{title}</h4>
                  <p dangerouslySetInnerHTML={{ __html: desc || '' }} className={styles.desc_content} />
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.preview}>
            <Button type="primary" size="large">
              ????????????
            </Button>
          </div>
        </Sider>
        <Content className={styles.cont}>
          <ArticleForm article={article} data={data} changeData={changeData} />
        </Content>
      </Layout>
    </Form>
  )
}
