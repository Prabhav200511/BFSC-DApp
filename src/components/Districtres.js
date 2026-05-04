import React from "react";
import { Table } from "react-bootstrap";
import { groupBy } from "lodash";

function Districtres({ transfered, received, orders }) {
  if (!transfered || !received) window.alert("Error in transactions!");
  const p = transfered.filter(o=>o.toId>80);
  const transfers = groupBy(p, "fromId");
  const results = Object.values(transfers).map((t) => {
    const shops = t.map((transfer) => {
      const shid = transfer.toId;
      const shopsa = orders.filter((order) => order.shopId === shid);
      const total = shopsa.reduce((acc, curr) => {
        const currTotal = curr.eachItemQuantities.reduce((acc2, curr2) => {
          return acc2+Number(curr2);
        }, 0);
        return acc + currTotal;
      }, 0);
      return ({
        shopID: shid,
        total: total,
        bags: transfer.Bags.length
      });
    });

    return {
        id: t[0].fromId,
        shopIds: shops.map(shop=>shop.shopID),
        total: shops.map(shop=>shop.total),
        bags: shops.map(shop=>shop.bags),
        quantity: shops.map(shop=>shop.bags*100)
    };

  });

  console.log("results", results);
    return (
        <div className="page-wrapper fade-in">
          <div className="page-header">
            <div>
              <h3>District Results</h3>
              <p className="page-subtitle">Aggregated transfer vs order quantities per district.</p>
            </div>
          </div>

          <div className="glass-panel card-pad">
            <div className="table-container">
              <Table hover className="table">
                <thead>
                  <tr>
                    <th>District ID</th>  
                    <th>Shop ID</th>
                    <th>Bags Sent</th>
                    <th>Qty Provided (Kg)</th>
                    <th>Qty Sold (Kg)</th>
                  </tr>
                </thead>
                <tbody>
                    {results.map((district, i)=>{
                        return(
                            <tr key={i}>
                                <td><span className="badge-chip">{district.id}</span></td>
                                <td>
                                {district.shopIds.map((shop, j)=>{
                                        return(
                                            <div key={j} style={{padding: '3px 0'}}><span className="badge-chip badge-purple">{shop}</span></div>
                                        )
                                    })}
                                </td>
                                <td>
                                {district.bags.map((shop, j)=>{
                                        return(
                                            <div key={j} style={{padding: '3px 0'}}>{shop}</div>
                                        )
                                    })}
                                </td>
                                <td>
                                {district.quantity.map((shop, j)=>{
                                        return(
                                            <div key={j} style={{padding: '3px 0'}}>{shop}</div>
                                        )
                                    })}
                                </td>
                                <td>
                                {district.total.map((shop, j)=>{
                                        return(
                                            <div key={j} style={{padding: '3px 0', color: shop > 0 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: shop > 0 ? 600 : 400}}>{shop}</div>
                                        )
                                    })}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      );
}

export default Districtres;
