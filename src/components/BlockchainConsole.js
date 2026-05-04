import React, { Component } from 'react'
import { Alert, Button, Form, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import { accountSelector, pdsSelector, web3Selector, networkIdSelector } from '../store/selectors'
import './App.css'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const DEMO_ACCOUNTS = {
    stateAdmin: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
    districtAdmin: '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b',
    shopOwner: '0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d',
    consumer: '0xd03ea8624C8C5987235048901fB614fDcA89b117',
    deliveryAgent: '0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC'
}

const ROLE_CONFIG = [
    {
        key: 'stateAdmin',
        label: 'State Admin',
        caption: 'Tokenize bags, add catalog items, register agents, assign pickups.',
        account: DEMO_ACCOUNTS.stateAdmin
    },
    {
        key: 'districtAdmin',
        label: 'District Admin',
        caption: 'Register ration shops and consumers for a district.',
        account: DEMO_ACCOUNTS.districtAdmin
    },
    {
        key: 'consumer',
        label: 'Consumer',
        caption: 'Sign a ration request from the beneficiary wallet.',
        account: DEMO_ACCOUNTS.consumer
    },
    {
        key: 'deliveryAgent',
        label: 'Delivery Agent',
        caption: 'Move assigned pickups through the delivery lifecycle.',
        account: DEMO_ACCOUNTS.deliveryAgent
    },
    {
        key: 'shopOwner',
        label: 'Shop Owner',
        caption: 'Confirm received stock, attest inventory, and fulfill orders.',
        account: DEMO_ACCOUNTS.shopOwner
    }
]

const DEFAULT_FORMS = {
    bagId: '2001',
    bagItem: 'Rice',
    itemId: '6',
    itemName: 'Millet',
    itemPrice: '35',
    deliveryAgentAddress: DEMO_ACCOUNTS.deliveryAgent,
    assignAgentAddress: DEMO_ACCOUNTS.deliveryAgent,
    assignShopId: '100',
    assignBagIds: '1001,1002',
    pickupId: '1',
    shopId: '103',
    shopName: 'Demo Campus FPS',
    shopAccount: DEMO_ACCOUNTS.shopOwner,
    shopLocation: 'Campus Block A',
    consumerAddress: DEMO_ACCOUNTS.consumer,
    inventoryShopId: '100',
    inventoryItemId: '2',
    inventoryQuantity: '5',
    requestShopId: '100',
    requestItemIds: '1,2',
    requestQuantities: '5,3'
}

const EMPTY_ROLES = {
    creator: false,
    stateAdmin: false,
    districtAdmin: false,
    shopOwner: false,
    consumer: false,
    deliveryAgent: false
}

class BlockchainConsole extends Component {
    state = {
        loading: false,
        txLoading: '',
        errorMessage: '',
        statusMessage: '',
        blockNumber: '',
        selectedRole: 'stateAdmin',
        roles: EMPTY_ROLES,
        creatorAddress: '',
        activeShop: null,
        shops: [],
        counts: {
            transfers: '0',
            received: '0',
            orders: '0',
            consumerRequests: '0',
            pickups: '0'
        },
        events: [],
        toasts: [],
        knownEventIds: [],
        eventSnapshotReady: false,
        eventSearch: '',
        shopSearch: '',
        forms: DEFAULT_FORMS
    }

    componentDidMount() {
        this.refreshConsole()
        this.refreshTimer = setInterval(this.refreshConsole, 15000)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.account !== this.props.account || prevProps.pds !== this.props.pds) {
            this.refreshConsole()
        }
    }

    componentWillUnmount() {
        if (this.refreshTimer) clearInterval(this.refreshTimer)
        if (this.toastTimer) clearTimeout(this.toastTimer)
    }

    setForm = (name, value) => {
        this.setState((prevState) => ({
            forms: {
                ...prevState.forms,
                [name]: value
            }
        }))
    }

    short = (value) => {
        if (!value) return 'Not connected'
        return `${value.slice(0, 8)}...${value.slice(-6)}`
    }

    parseIds = (value) => {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
    }

    currentRoleLabel = () => {
        const active = ROLE_CONFIG.find((role) => this.state.roles[role.key])
        return active ? active.label : 'No demo role active'
    }

    activeRoleKeys = () => {
        return ROLE_CONFIG
            .filter((role) => this.state.roles[role.key])
            .map((role) => role.key)
    }

    refreshConsole = async () => {
        const { pds, account, web3 } = this.props
        if (!pds || !account || !web3) return

        this.setState({ loading: true, errorMessage: '' })

        try {
            const creatorAddress = await pds.methods.creator().call()
            const [
                blockNumber,
                isStateAdmin,
                isDistrictAdmin,
                isConsumer,
                isDeliveryAgent,
                transfers,
                received,
                orders,
                consumerRequests,
                pickups
            ] = await Promise.all([
                web3.eth.getBlockNumber(),
                pds.methods.stateAdmin(account).call(),
                pds.methods.districtAdmin(account).call(),
                pds.methods.consumer(account).call(),
                pds.methods.deliveryAgents(account).call(),
                pds.methods.transfersCount().call(),
                pds.methods.receivedCount().call(),
                pds.methods.ordersCount().call(),
                pds.methods.consumerRequestsCount().call(),
                pds.methods.nextPickupId().call()
            ])

            const shopIds = [100, 101, 102, 103, 104, 105]
            const shops = await Promise.all(shopIds.map(async (shopId) => {
                try {
                    const shop = await pds.methods.shops(shopId).call()
                    const exists = shop.exists && shop.account !== ZERO_ADDRESS
                    return {
                        id: shop.id,
                        name: shop.name,
                        account: shop.account,
                        location: shop.location,
                        exists: exists,
                        ownedByActiveWallet: exists && shop.account.toLowerCase() === account.toLowerCase()
                    }
                } catch (error) {
                    return null
                }
            }))

            const visibleShops = shops.filter((shop) => shop && shop.exists)
            const activeShop = visibleShops.find((shop) => shop.ownedByActiveWallet) || null
            const roles = {
                creator: creatorAddress.toLowerCase() === account.toLowerCase(),
                stateAdmin: isStateAdmin,
                districtAdmin: isDistrictAdmin,
                shopOwner: Boolean(activeShop),
                consumer: isConsumer,
                deliveryAgent: isDeliveryAgent
            }
            const events = await this.loadEvents(pds, web3)
            const activeRole = ROLE_CONFIG.find((role) => roles[role.key])

            this.setState((prevState) => {
                const eventIds = events.map((event) => event.id)
                const freshEvents = prevState.eventSnapshotReady
                    ? events.filter((event) => !prevState.knownEventIds.includes(event.id)).slice(0, 3)
                    : []

                if (freshEvents.length > 0) {
                    if (this.toastTimer) clearTimeout(this.toastTimer)
                    this.toastTimer = setTimeout(() => this.setState({ toasts: [] }), 6500)
                }

                return {
                    blockNumber: blockNumber,
                    creatorAddress: creatorAddress,
                    roles: roles,
                    selectedRole: activeRole ? activeRole.key : prevState.selectedRole,
                    activeShop: activeShop,
                    shops: visibleShops,
                    counts: {
                        transfers: transfers,
                        received: received,
                        orders: orders,
                        consumerRequests: consumerRequests,
                        pickups: pickups
                    },
                    events: events,
                    toasts: freshEvents,
                    knownEventIds: eventIds,
                    eventSnapshotReady: true,
                    loading: false
                }
            })
        } catch (error) {
            this.setState({
                errorMessage: error.message,
                loading: false
            })
        }
    }

    loadEvents = async (pds, web3) => {
        const eventNames = [
            'StateAdminAdded',
            'DistrictAdminAdded',
            'ShopAdded',
            'ConsumerAdded',
            'DeliveryAgentAdded',
            'BagAdded',
            'ItemAdded',
            'Transfered',
            'Received',
            'ConsumerOrderRequested',
            'Order',
            'RationPickupAssigned',
            'RationPickedUp',
            'RationDeliveredToShop',
            'RationReceiptConfirmed',
            'InventoryUpdated',
            'LowStockAlert'
        ]

        const eventGroups = await Promise.all(eventNames.map(async (eventName) => {
            try {
                return await pds.getPastEvents(eventName, { fromBlock: 0, toBlock: 'latest' })
            } catch (error) {
                return []
            }
        }))

        const sortedEvents = eventGroups
            .reduce((all, group) => all.concat(group), [])
            .sort((a, b) => {
                if (b.blockNumber !== a.blockNumber) return b.blockNumber - a.blockNumber
                return b.logIndex - a.logIndex
            })
            .slice(0, 18)

        const blockCache = {}
        return Promise.all(sortedEvents.map(async (event) => {
            if (!blockCache[event.blockNumber]) {
                blockCache[event.blockNumber] = await web3.eth.getBlock(event.blockNumber)
            }
            const block = blockCache[event.blockNumber]
            const presentation = this.eventPresentation(event)
            return {
                id: `${event.transactionHash}-${event.logIndex}`,
                name: event.event,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                payload: this.eventPayload(event),
                timestamp: Number(block.timestamp),
                timeLabel: moment.unix(Number(block.timestamp)).format('h:mm A'),
                relativeTime: moment.unix(Number(block.timestamp)).fromNow(),
                summary: this.eventSummary(event),
                relatedEntity: presentation.relatedEntity,
                title: presentation.title,
                type: presentation.type,
                status: presentation.status
            }
        }))
    }

    eventPresentation = (event) => {
        const data = event.returnValues
        switch (event.event) {
            case 'ConsumerOrderRequested':
                return {
                    type: 'info',
                    status: 'Pending',
                    title: 'Consumer placed ration request',
                    relatedEntity: `Shop ${data.shopId}`
                }
            case 'Order':
                return {
                    type: 'success',
                    status: 'Completed',
                    title: 'Shop fulfilled consumer order',
                    relatedEntity: `Shop ${data.shopId}`
                }
            case 'RationPickupAssigned':
                return {
                    type: 'info',
                    status: 'Assigned',
                    title: 'State Admin assigned delivery pickup',
                    relatedEntity: `Pickup ${data.pickupId}`
                }
            case 'RationPickedUp':
                return {
                    type: 'warning',
                    status: 'In Transit',
                    title: 'Delivery agent marked pickup as picked up',
                    relatedEntity: `Pickup ${data.pickupId}`
                }
            case 'RationDeliveredToShop':
                return {
                    type: 'success',
                    status: 'Delivered',
                    title: 'Delivery agent marked pickup as delivered',
                    relatedEntity: `Shop ${data.shopId}`
                }
            case 'RationReceiptConfirmed':
                return {
                    type: 'success',
                    status: 'Confirmed',
                    title: 'Shop Owner confirmed receipt',
                    relatedEntity: `Pickup ${data.pickupId}`
                }
            case 'ShopAdded':
                return {
                    type: 'success',
                    status: 'Registered',
                    title: 'District Admin registered new shop',
                    relatedEntity: `Shop ${data.id}`
                }
            case 'ConsumerAdded':
                return {
                    type: 'success',
                    status: 'Registered',
                    title: 'District Admin registered consumer',
                    relatedEntity: this.short(data.consumer)
                }
            case 'DeliveryAgentAdded':
                return {
                    type: 'success',
                    status: 'Registered',
                    title: 'State Admin registered delivery agent',
                    relatedEntity: this.short(data.agent)
                }
            case 'LowStockAlert':
                return {
                    type: 'warning',
                    status: 'Low Stock',
                    title: 'Inventory dropped below threshold',
                    relatedEntity: `Shop ${data.shopId}, Item ${data.itemId}`
                }
            case 'InventoryUpdated':
                return {
                    type: 'info',
                    status: 'Updated',
                    title: 'Shop inventory attested',
                    relatedEntity: `Shop ${data.shopId}, Item ${data.itemId}`
                }
            case 'Transfered':
                return {
                    type: 'info',
                    status: 'Transferred',
                    title: 'Supply transfer recorded',
                    relatedEntity: `${data.fromId} to ${data.toId}`
                }
            case 'Received':
                return {
                    type: 'success',
                    status: 'Received',
                    title: 'Supply receipt recorded',
                    relatedEntity: `${data.fromId} to ${data.toId}`
                }
            default:
                return {
                    type: 'info',
                    status: 'Logged',
                    title: event.event,
                    relatedEntity: `Block ${event.blockNumber}`
                }
        }
    }

    eventPayload = (event) => {
        const data = event.returnValues
        switch (event.event) {
            case 'ConsumerOrderRequested':
                return {
                    requestId: data.id,
                    consumerAddress: data.consumerAddress,
                    shopId: String(data.shopId),
                    itemIds: Array.from(data.itemIds || []).map(String),
                    quantities: Array.from(data.quantities || []).map(String),
                    estimatedCost: String(data.estimatedCost)
                }
            case 'Order':
                return {
                    orderId: data.id,
                    customerAddress: data.customerAddress,
                    shopId: String(data.shopId),
                    itemIds: Array.from(data.itemIds || []).map(String),
                    quantities: Array.from(data.quantities || []).map(String)
                }
            default:
                return data
        }
    }

    fulfillmentKey = (payload) => {
        if (!payload) return ''
        const customer = (payload.customerAddress || payload.consumerAddress || '').toLowerCase()
        const shopId = String(payload.shopId || '')
        const itemIds = (payload.itemIds || []).map(String).join(',')
        const quantities = (payload.quantities || []).map(String).join(',')
        return `${customer}|${shopId}|${itemIds}|${quantities}`
    }

    pendingRequests = () => {
        const fulfilled = new Set(
            this.state.events
                .filter((event) => event.name === 'Order')
                .map((event) => this.fulfillmentKey(event.payload))
        )

        return this.state.events
            .filter((event) => event.name === 'ConsumerOrderRequested')
            .filter((event) => !fulfilled.has(this.fulfillmentKey(event.payload)))
    }

    eventSummary = (event) => {
        const data = event.returnValues
        switch (event.event) {
            case 'Transfered':
                return `from ${data.fromId} to ${data.toId} | bags ${data.bagIds.join(', ')}`
            case 'Received':
                return `from ${data.fromId} to ${data.toId} | bags ${data.bagIds.join(', ')}`
            case 'Order':
                return `shop ${data.shopId} fulfilled for ${this.short(data.customerAddress)}`
            case 'ConsumerOrderRequested':
                return `shop ${data.shopId} requested by ${this.short(data.consumerAddress)} | cost ${data.estimatedCost}`
            case 'ShopAdded':
                return `shop ${data.id} | ${data.name}`
            case 'ConsumerAdded':
                return `consumer ${this.short(data.consumer)}`
            case 'DeliveryAgentAdded':
                return `agent ${this.short(data.agent)}`
            case 'RationPickupAssigned':
                return `pickup ${data.pickupId} for shop ${data.shopId}`
            case 'RationPickedUp':
                return `pickup ${data.pickupId} picked up`
            case 'RationDeliveredToShop':
                return `pickup ${data.pickupId} delivered to shop ${data.shopId}`
            case 'RationReceiptConfirmed':
                return `pickup ${data.pickupId} confirmed by shop ${data.shopId}`
            case 'InventoryUpdated':
                return `shop ${data.shopId} item ${data.itemId} quantity ${data.newQuantity}`
            case 'LowStockAlert':
                return `shop ${data.shopId} item ${data.itemId} low stock ${data.currentQuantity}`
            case 'BagAdded':
                return `bag ${data.id} | ${data.item}`
            case 'ItemAdded':
                return `item ${data.id} | ${data.name} | price ${data.price}`
            case 'StateAdminAdded':
                return `state admin ${this.short(data.admin)}`
            case 'DistrictAdminAdded':
                return `district admin ${this.short(data.admin)}`
            default:
                return 'on-chain event'
        }
    }

    sendTx = async (label, transactionFactory) => {
        this.setState({ txLoading: label, errorMessage: '', statusMessage: '' })
        try {
            const receipt = await transactionFactory()
            this.setState({
                statusMessage: `${label} mined in block ${receipt.blockNumber} | ${this.short(receipt.transactionHash)}`,
                txLoading: ''
            })
            await this.refreshConsole()
        } catch (error) {
            this.setState({
                errorMessage: error.message,
                txLoading: ''
            })
        }
    }

    requireRole = (roleKey, label, callback) => {
        const role = ROLE_CONFIG.find((item) => item.key === roleKey)
        if (!this.state.roles[roleKey]) {
            this.setState({
                errorMessage: `Switch MetaMask to ${role.label} first: ${role.account}`,
                statusMessage: ''
            })
            return
        }
        callback()
    }

    runTxForRole = (roleKey, label, callback) => {
        this.requireRole(roleKey, label, () => this.sendTx(label, callback))
    }

    addBag = () => {
        const { pds, account } = this.props
        const { bagId, bagItem } = this.state.forms
        this.runTxForRole('stateAdmin', 'Bag tokenization', () => pds.methods.addBags(bagId, bagItem).send({ from: account }))
    }

    addItem = () => {
        const { pds, account } = this.props
        const { itemId, itemName, itemPrice } = this.state.forms
        this.runTxForRole('stateAdmin', 'Item catalog update', () => pds.methods.addItems(itemId, itemName, itemPrice).send({ from: account }))
    }

    addDeliveryAgent = () => {
        const { pds, account } = this.props
        const { deliveryAgentAddress } = this.state.forms
        this.runTxForRole('stateAdmin', 'Delivery agent registration', () => pds.methods.addDeliveryAgent(deliveryAgentAddress).send({ from: account }))
    }

    assignPickup = () => {
        const { pds, account } = this.props
        const { assignAgentAddress, assignShopId, assignBagIds } = this.state.forms
        this.runTxForRole('stateAdmin', 'Ration pickup assignment', () => {
            return pds.methods.assignRationPickup(
                assignAgentAddress,
                assignShopId,
                this.parseIds(assignBagIds)
            ).send({ from: account })
        })
    }

    addShop = () => {
        const { pds, account } = this.props
        const { shopId, shopName, shopAccount, shopLocation } = this.state.forms
        this.runTxForRole('districtAdmin', 'Shop registration', () => {
            return pds.methods.addShops(shopId, shopName, shopAccount, shopLocation).send({ from: account })
        })
    }

    addConsumer = () => {
        const { pds, account } = this.props
        const { consumerAddress } = this.state.forms
        this.runTxForRole('districtAdmin', 'Consumer registration', () => pds.methods.addConsumer(consumerAddress).send({ from: account }))
    }

    markPickedUp = () => {
        const { pds, account } = this.props
        this.runTxForRole('deliveryAgent', 'Pickup status: picked up', () => pds.methods.markRationPickedUp(this.state.forms.pickupId).send({ from: account }))
    }

    markDelivered = () => {
        const { pds, account } = this.props
        this.runTxForRole('deliveryAgent', 'Pickup status: delivered', () => pds.methods.markRationDelivered(this.state.forms.pickupId).send({ from: account }))
    }

    confirmReceipt = () => {
        const { pds, account } = this.props
        this.runTxForRole('shopOwner', 'Shop receipt confirmation', () => pds.methods.confirmRationReceipt(this.state.forms.pickupId).send({ from: account }))
    }

    updateInventory = () => {
        const { pds, account } = this.props
        const { inventoryShopId, inventoryItemId, inventoryQuantity } = this.state.forms
        this.runTxForRole('shopOwner', 'Inventory attestation', () => {
            return pds.methods.updateShopInventory(inventoryShopId, inventoryItemId, inventoryQuantity).send({ from: account })
        })
    }

    requestOrder = () => {
        const { pds, account } = this.props
        const { requestShopId, requestItemIds, requestQuantities } = this.state.forms
        this.runTxForRole('consumer', 'Consumer order request', () => {
            return pds.methods.placeConsumerOrder(
                requestShopId,
                this.parseIds(requestItemIds),
                this.parseIds(requestQuantities)
            ).send({ from: account })
        })
    }

    renderTextInput = (label, name, placeholder) => {
        return (
            <Form.Group className="mb-3" controlId={`bc-${name}`}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={placeholder}
                    value={this.state.forms[name]}
                    onChange={(event) => this.setForm(name, event.target.value)}
                />
            </Form.Group>
        )
    }

    renderRoleRail = () => {
        const { selectedRole, roles } = this.state
        return (
            <aside className="role-sidebar glass-panel">
                <div className="role-sidebar-brand">
                    <span className="brand-mark">PDS</span>
                    <div>
                        <strong>Role Switcher</strong>
                        <span>Use MetaMask account menu</span>
                    </div>
                </div>

                <div className="role-sidebar-list">
                    {ROLE_CONFIG.map((role) => {
                        const isSelected = selectedRole === role.key
                        const isActiveWallet = roles[role.key]
                        return (
                            <button
                                type="button"
                                key={role.key}
                                className={`role-nav-item ${isSelected ? 'role-nav-selected' : ''}`}
                                onClick={() => this.setState({ selectedRole: role.key, errorMessage: '', statusMessage: '' })}
                            >
                                <span className="role-nav-icon">{role.label.slice(0, 2).toUpperCase()}</span>
                                <span className="role-nav-copy">
                                    <strong>{role.label}</strong>
                                    <span>{this.short(role.account)}</span>
                                </span>
                                <span className={`role-status-dot ${isActiveWallet ? 'role-status-on' : ''}`}></span>
                            </button>
                        )
                    })}
                </div>

                <div className="switch-help">
                    <strong>How role switching works</strong>
                    <span>Open MetaMask, click the account avatar, choose the imported role account, then hit Refresh Proof.</span>
                </div>
            </aside>
        )
    }

    renderTopBar = () => {
        const { account, pds, networkId } = this.props
        const { blockNumber, loading } = this.state
        return (
            <div className="console-topbar glass-panel">
                <div className="wallet-identity">
                    <span className="wallet-avatar">{this.currentRoleLabel().slice(0, 2).toUpperCase()}</span>
                    <div>
                        <span className="metric-label">Active MetaMask Role</span>
                        <strong>{this.currentRoleLabel()}</strong>
                    </div>
                </div>
                <div className="topbar-metrics">
                    <div>
                        <span className="metric-label">Wallet</span>
                        <strong className="mono">{this.short(account)}</strong>
                    </div>
                    <div>
                        <span className="metric-label">Network</span>
                        <strong>{networkId || 'Unknown'}</strong>
                    </div>
                    <div>
                        <span className="metric-label">Block</span>
                        <strong>{blockNumber || '-'}</strong>
                    </div>
                    <div>
                        <span className="metric-label">Contract</span>
                        <strong className="mono">{this.short(pds.options.address)}</strong>
                    </div>
                </div>
                <div className="notification-bell" title="Recent smart contract alerts">
                    <span>Alerts</span>
                    <strong>{this.state.events.length}</strong>
                </div>
                <Button type="button" variant="primary" onClick={this.refreshConsole} disabled={loading || Boolean(this.state.txLoading)}>
                    {loading ? 'Refreshing' : 'Refresh Proof'}
                </Button>
            </div>
        )
    }

    renderRoleHeader = () => {
        const role = ROLE_CONFIG.find((item) => item.key === this.state.selectedRole)
        const isActive = this.state.roles[role.key]
        return (
            <div className="selected-role-card glass-panel">
                <div>
                    <span className="metric-label">Selected Role Workspace</span>
                    <h2>{role.label}</h2>
                    <p>{role.caption}</p>
                </div>
                <div className="selected-role-proof">
                    <span className={isActive ? 'access-chip access-chip-live' : 'access-chip'}>
                        {isActive ? 'Active in MetaMask' : 'Switch MetaMask'}
                    </span>
                    <span className="mono">{role.account}</span>
                </div>
            </div>
        )
    }

    renderCounts = () => {
        const { counts } = this.state
        return (
            <div className="console-metrics console-counts">
                <div className="metric-tile glass-panel">
                    <span className="metric-label">Transfers</span>
                    <strong>{counts.transfers}</strong>
                </div>
                <div className="metric-tile glass-panel">
                    <span className="metric-label">Receipts</span>
                    <strong>{counts.received}</strong>
                </div>
                <div className="metric-tile glass-panel">
                    <span className="metric-label">Fulfilled Orders</span>
                    <strong>{counts.orders}</strong>
                </div>
                <div className="metric-tile glass-panel">
                    <span className="metric-label">Consumer Requests</span>
                    <strong>{counts.consumerRequests}</strong>
                </div>
                <div className="metric-tile glass-panel">
                    <span className="metric-label">Pickups</span>
                    <strong>{counts.pickups}</strong>
                </div>
            </div>
        )
    }

    renderSystemFlow = () => {
        const hasRequest = this.pendingRequests().length > 0
        const hasOrder = this.state.events.some((event) => event.name === 'Order')
        const hasDelivered = this.state.events.some((event) => event.name === 'RationDeliveredToShop')
        const hasConfirmed = this.state.events.some((event) => event.name === 'RationReceiptConfirmed')
        const steps = [
            {
                label: 'Consumer',
                title: 'Ration Request',
                status: hasRequest ? 'Pending' : 'Waiting',
                active: hasRequest
            },
            {
                label: 'Shop',
                title: 'Review and Fulfill',
                status: hasOrder ? 'Approved' : hasRequest ? 'Pending' : 'Waiting',
                active: hasOrder
            },
            {
                label: 'Delivery',
                title: 'Pickup Movement',
                status: hasDelivered ? 'Delivered' : 'Assigned',
                active: hasDelivered
            },
            {
                label: 'Completion',
                title: 'Receipt and Inventory',
                status: hasConfirmed ? 'Completed' : 'Open',
                active: hasConfirmed
            }
        ]

        return (
            <div className="system-flow glass-panel">
                <div className="console-section-head">
                    <h4>System Flow</h4>
                    <span className="access-chip">Consumer to Completion</span>
                </div>
                <div className="flow-steps">
                    {steps.map((step, index) => (
                        <div key={step.label} className={`flow-step ${step.active ? 'flow-step-active' : ''}`}>
                            <span className="flow-index">{index + 1}</span>
                            <div>
                                <strong>{step.label}</strong>
                                <span>{step.title}</span>
                            </div>
                            <span className={`status-badge status-${step.status.toLowerCase()}`}>{step.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    renderActivityFeed = () => {
        return (
            <div className="activity-feed glass-panel">
                <div className="console-section-head">
                    <h4>Activity Feed</h4>
                    <span className="access-chip access-chip-live">Live</span>
                </div>
                <div className="activity-list">
                    {this.state.events.slice(0, 7).map((event) => (
                        <div key={event.id} className={`activity-item activity-${event.type}`}>
                            <span className="activity-dot"></span>
                            <div>
                                <strong>{event.title}</strong>
                                <span>{event.relatedEntity} · {event.relativeTime}</span>
                            </div>
                            <span className={`status-badge status-${event.status.toLowerCase().replace(/\s/g, '-')}`}>{event.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    renderRoleInsights = () => {
        return (
            <div className="role-insights-grid">
                {this.renderSystemFlow()}
                {this.renderActivityFeed()}
            </div>
        )
    }

    renderStatePanel = () => {
        const busy = Boolean(this.state.txLoading)
        return (
            <div className="role-action-grid">
                <div className="console-action-card glass-panel">
                    <div className="console-action-head">
                        <h4>Tokenize Supply</h4>
                        <span className="access-chip access-chip-live">STATE_ADMIN</span>
                    </div>
                    {this.renderTextInput('Bag ID', 'bagId', '2001')}
                    {this.renderTextInput('Bag Item', 'bagItem', 'Rice')}
                    <Button type="button" variant="primary" disabled={busy} onClick={this.addBag}>Tokenize Bag</Button>
                </div>

                <div className="console-action-card glass-panel">
                    <div className="console-action-head">
                        <h4>Catalog Item</h4>
                        <span className="access-chip access-chip-live">STATE_ADMIN</span>
                    </div>
                    {this.renderTextInput('Item ID', 'itemId', '6')}
                    {this.renderTextInput('Item Name', 'itemName', 'Millet')}
                    {this.renderTextInput('Item Price', 'itemPrice', '35')}
                    <Button type="button" variant="primary" disabled={busy} onClick={this.addItem}>Add Item</Button>
                </div>

                <div className="console-action-card glass-panel">
                    <div className="console-action-head">
                        <h4>Delivery Assignment</h4>
                        <span className="access-chip access-chip-live">STATE_ADMIN</span>
                    </div>
                    {this.renderTextInput('Delivery Agent Wallet', 'deliveryAgentAddress', '0x...')}
                    <Button type="button" variant="primary" disabled={busy} onClick={this.addDeliveryAgent}>Register Agent</Button>
                    <div className="divider" />
                    {this.renderTextInput('Assigned Agent Wallet', 'assignAgentAddress', '0x...')}
                    {this.renderTextInput('Shop ID', 'assignShopId', '100')}
                    {this.renderTextInput('Bag IDs', 'assignBagIds', '1001,1002')}
                    <Button type="button" variant="primary" disabled={busy} onClick={this.assignPickup}>Assign Pickup</Button>
                </div>
            </div>
        )
    }

    renderDistrictPanel = () => {
        const busy = Boolean(this.state.txLoading)
        return (
            <div className="role-action-grid">
                <div className="console-action-card glass-panel">
                    <div className="console-action-head">
                        <h4>Register Shop</h4>
                        <span className="access-chip access-chip-live">DISTRICT_ADMIN</span>
                    </div>
                    {this.renderTextInput('Shop ID', 'shopId', '103')}
                    {this.renderTextInput('Shop Name', 'shopName', 'Demo Campus FPS')}
                    {this.renderTextInput('Shop Wallet', 'shopAccount', '0x...')}
                    {this.renderTextInput('Location', 'shopLocation', 'Campus Block A')}
                    <Button type="button" variant="primary" disabled={busy} onClick={this.addShop}>Register Shop</Button>
                </div>

                <div className="console-action-card glass-panel">
                    <div className="console-action-head">
                        <h4>Register Consumer</h4>
                        <span className="access-chip access-chip-live">DISTRICT_ADMIN</span>
                    </div>
                    {this.renderTextInput('Consumer Wallet', 'consumerAddress', '0x...')}
                    <Button type="button" variant="primary" disabled={busy} onClick={this.addConsumer}>Register Consumer</Button>
                </div>
            </div>
        )
    }

    renderConsumerPanel = () => {
        const busy = Boolean(this.state.txLoading)
        return (
            <div className="role-action-grid">
                <div className="console-action-card glass-panel">
                    <div className="console-action-head">
                        <h4>Request Ration</h4>
                        <span className="access-chip access-chip-live">CONSUMER</span>
                    </div>
                    {this.renderTextInput('Shop ID', 'requestShopId', '100')}
                    {this.renderTextInput('Item IDs', 'requestItemIds', '1,2')}
                    {this.renderTextInput('Quantities', 'requestQuantities', '5,3')}
                    <Button type="button" variant="primary" disabled={busy} onClick={this.requestOrder}>Sign Request</Button>
                </div>
            </div>
        )
    }

    renderDeliveryPanel = () => {
        const busy = Boolean(this.state.txLoading)
        return (
            <div className="role-action-grid">
                <div className="console-action-card glass-panel">
                    <div className="console-action-head">
                        <h4>Pickup Lifecycle</h4>
                        <span className="access-chip access-chip-live">DELIVERY_AGENT</span>
                    </div>
                    {this.renderTextInput('Pickup ID', 'pickupId', '1')}
                    <div className="btn-group-actions">
                        <Button type="button" variant="primary" disabled={busy} onClick={this.markPickedUp}>Mark Picked Up</Button>
                        <Button type="button" variant="primary" disabled={busy} onClick={this.markDelivered}>Mark Delivered</Button>
                    </div>
                </div>
            </div>
        )
    }

    renderShopPanel = () => {
        const busy = Boolean(this.state.txLoading)
        const requests = this.pendingRequests()
        return (
            <div className="role-action-grid">
                <div className="console-action-card glass-panel request-queue-card">
                    <div className="console-action-head">
                        <h4>Pending Consumer Requests</h4>
                        <span className="access-chip access-chip-live">{requests.length}</span>
                    </div>
                    <div className="request-queue">
                        {requests.length === 0 ? (
                            <p className="empty-state">No pending consumer requests. Fulfilled requests are removed from this queue after the matching Order event appears.</p>
                        ) : requests.map((request) => (
                            <Link
                                className="request-row request-row-link"
                                key={request.id}
                                to={{
                                    pathname: '/order',
                                    search: `?consumer=${encodeURIComponent(request.payload.consumerAddress)}&shopId=${encodeURIComponent(request.payload.shopId)}&items=${encodeURIComponent(request.payload.itemIds.join(','))}&quantities=${encodeURIComponent(request.payload.quantities.join(','))}`,
                                    state: {
                                        pendingOrder: {
                                            requestId: request.payload.requestId,
                                            address: request.payload.consumerAddress,
                                            shopId: request.payload.shopId,
                                            itemIds: request.payload.itemIds,
                                            quantities: request.payload.quantities,
                                            estimatedCost: request.payload.estimatedCost
                                        }
                                    }
                                }}
                            >
                                <div>
                                    <strong>{request.relatedEntity}</strong>
                                    <span>{request.summary} - click to autofill fulfillment</span>
                                </div>
                                <span className="status-badge status-pending">Pending</span>
                            </Link>
                        ))}
                    </div>
                    <Link to="/order" className="btn-outline request-action-link">Open Make Order Manually</Link>
                </div>

                <div className="console-action-card glass-panel">
                    <div className="console-action-head">
                        <h4>Receipt Confirmation</h4>
                        <span className="access-chip access-chip-live">SHOP_OWNER</span>
                    </div>
                    {this.renderTextInput('Pickup ID', 'pickupId', '1')}
                    <Button type="button" variant="primary" disabled={busy} onClick={this.confirmReceipt}>Confirm Receipt</Button>
                    <div className="divider" />
                    {this.renderTextInput('Inventory Shop ID', 'inventoryShopId', '100')}
                    {this.renderTextInput('Inventory Item ID', 'inventoryItemId', '2')}
                    {this.renderTextInput('Quantity', 'inventoryQuantity', '5')}
                    <Button type="button" variant="primary" disabled={busy} onClick={this.updateInventory}>Attest Inventory</Button>
                </div>
            </div>
        )
    }

    renderSelectedRolePanel = () => {
        switch (this.state.selectedRole) {
            case 'stateAdmin':
                return this.renderStatePanel()
            case 'districtAdmin':
                return this.renderDistrictPanel()
            case 'consumer':
                return this.renderConsumerPanel()
            case 'deliveryAgent':
                return this.renderDeliveryPanel()
            case 'shopOwner':
                return this.renderShopPanel()
            default:
                return this.renderStatePanel()
        }
    }

    renderTables = () => {
        const { shops, events, shopSearch, eventSearch } = this.state
        const filteredShops = shops.filter((shop) => {
            const search = shopSearch.toLowerCase()
            return !search || shop.name.toLowerCase().includes(search) || String(shop.id).includes(search) || shop.account.toLowerCase().includes(search)
        })
        const filteredEvents = events.filter((event) => {
            const search = eventSearch.toLowerCase()
            return !search || event.name.toLowerCase().includes(search) || event.summary.toLowerCase().includes(search) || event.transactionHash.toLowerCase().includes(search)
        })
        return (
            <div className="console-grid console-grid-secondary">
                <div className="glass-panel console-table-card">
                    <div className="console-section-head">
                        <h4>Registered Shops</h4>
                        <div className="table-tools">
                            <input
                                value={shopSearch}
                                onChange={(event) => this.setState({ shopSearch: event.target.value })}
                                placeholder="Search shops"
                                aria-label="Search shops"
                            />
                            <span className="access-chip access-chip-live">{filteredShops.length}</span>
                        </div>
                    </div>
                    <div className="table-container compact-table">
                        <Table hover className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Owner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.map((shop) => (
                                    <tr key={shop.id}>
                                        <td><span className="badge-chip">{shop.id}</span></td>
                                        <td>{shop.name}</td>
                                        <td className="mono">{this.short(shop.account)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>

                <div className="glass-panel console-table-card">
                    <div className="console-section-head">
                        <h4>Latest Event Stream</h4>
                        <div className="table-tools">
                            <input
                                value={eventSearch}
                                onChange={(event) => this.setState({ eventSearch: event.target.value })}
                                placeholder="Search events"
                                aria-label="Search events"
                            />
                            <span className="access-chip access-chip-live">logs</span>
                        </div>
                    </div>
                    <div className="table-container compact-table">
                        <Table hover className="table">
                            <thead>
                                <tr>
                                    <th>Block</th>
                                    <th>Event</th>
                                    <th>Summary</th>
                                    <th>Tx</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center">No events yet.</td>
                                    </tr>
                                ) : filteredEvents.map((event, index) => (
                                    <tr key={`${event.transactionHash}-${index}`}>
                                        <td>{event.blockNumber}</td>
                                        <td><span className="badge-chip badge-purple">{event.name}</span></td>
                                        <td>{event.summary}</td>
                                        <td className="mono">{this.short(event.transactionHash)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        )
    }

    renderToastStack = () => {
        if (this.state.toasts.length === 0) return null
        return (
            <div className="toast-stack">
                {this.state.toasts.map((toast) => (
                    <div key={toast.id} className={`toast-card toast-${toast.type}`}>
                        <div>
                            <strong>{toast.title}</strong>
                            <span>{toast.relatedEntity} · {toast.timeLabel}</span>
                        </div>
                        <button type="button" onClick={() => this.setState((prevState) => ({
                            toasts: prevState.toasts.filter((item) => item.id !== toast.id)
                        }))}>
                            Dismiss
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    render() {
        const { account, pds } = this.props
        const { txLoading, statusMessage, errorMessage } = this.state

        if (!pds || !account) {
            return (
                <div className="page-wrapper fade-in">
                    <div className="page-header">
                        <h2 className="gradient-text">Web3 Role Console</h2>
                        <p>Connect MetaMask to load the deployed PDS contract.</p>
                    </div>
                </div>
            )
        }

        return (
            <div className="console-shell fade-in">
                {this.renderRoleRail()}
                <main className="console-main">
                    {this.renderTopBar()}
                    {statusMessage && <Alert variant="success">{statusMessage}</Alert>}
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    {this.renderRoleHeader()}
                    {this.renderCounts()}
                    {this.renderRoleInsights()}
                    {this.renderSelectedRolePanel()}
                    {this.renderTables()}
                </main>

                {this.renderToastStack()}

                {txLoading && (
                    <div className="tx-busy glass-panel">
                        Waiting for MetaMask confirmation: {txLoading}
                    </div>
                )}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        account: accountSelector(state),
        pds: pdsSelector(state),
        web3: web3Selector(state),
        networkId: networkIdSelector(state)
    }
}

export default connect(mapStateToProps)(BlockchainConsole)
