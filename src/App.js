import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Pagination from "./Pagination";
import * as XLSX from "xlsx";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [locationFilter, setLocationFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage, industryFilter]);

  useEffect(() => {
    let result;
    if (data != null) {
      result = data.find(
        (item) =>
          item.customerName.includes(searchTerm) ||
          item.descriptionSummary.includes(searchTerm)
      );
    }
    setData([result]);
  }, [searchTerm]);

  useEffect(() => {
    let result;
    
    if (data != null) {
      result = data.filter(
        (item) =>
          item.location === locationFilter
      );
    }
    console.log(result);
    setData([result]);
  }, [locationFilter]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/data");
      const items = response.data.items.map((item) => ({
        id: item.item.id,
        logoUrl: item.item.additionalFields.imageSrcUrl,
        customerName: item.item.additionalFields["customer-name"],
        headline: item.item.additionalFields.headline,
        url: item.item.additionalFields.headlineUrl,
        descriptionSummary: item.item.additionalFields.descriptionSummary,
        pageUrl: item.item.additionalFields.headlineUrl,
        location: item.item.additionalFields.displayLocation,
        industry:
          item.tags.find((tag) => tag.tagNamespaceId === "GLOBAL#industry")
            ?.name || "",
      }));
      console.log(items);
      setData(items);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
    console.log(e.target.value);
    setCurrentPage(1);
  };

  const handleIndustryChange = (e) => {
    setIndustryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    setCurrentPage(1);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        "Customer Logo": item.item.additionalFields.imageSrcUrl,
        "Customer Name": item.item.additionalFields["customer-name"],
        Headline: item.item.additionalFields.headline,
        URL: item.item.additionalFields.headlineUrl,
        "Description Summary": item.item.additionalFields.descriptionSummary,
        "Page URL": item.item.additionalFields.headlineUrl,
        Location: item.item.additionalFields.displayLocation,
        Industry:
          item.tags.find((tag) => tag.tagNamespaceId === "GLOBAL#industry")
            ?.name || "",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");
    XLSX.writeFile(workbook, "table_data.xlsx");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <select value={locationFilter} onChange={handleLocationChange}>
          <option value="">All Locations</option>

          {data.length > 0 ? (
            data.map((loc, key) => (
              <option key={key} value={loc.location}>
                {loc.location}
              </option>
            ))
          ) : (
            <></>
          )}
        </select>
        <select value={industryFilter} onChange={handleIndustryChange}>
          <option value="">All Industries</option>
          {data.length > 0 ? (
            data.map((item, key) => (
              <option key={key} value={item.industry}>
                {item.industry}
              </option>
            ))
          ) : (
            <></>
          )}
        </select>
        <button onClick={handleExport}>Export to Excel</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Customer Logo</th>
            <th>Customer Name</th>
            <th>Headline</th>
            <th>URL</th>
            <th>Description Summary</th>
            <th>Page URL</th>
            <th>Location</th>
            <th>Industry</th>
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((item, key = item.id) => (
              <tr className="rowdata">
                <td>
                  <img src={item.logoUrl} alt="Customer Logo" />
                </td>
                <td>{item.customerName}</td>
                <td>{item.headline}</td>
                <td>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </td>
                <td>
                  <p>{item.descriptionSummary}</p>
                </td>
                <td>
                  <a
                    href={item.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.pageUrl}
                  </a>
                </td>
                <td> {item.location}</td>
                <td>{item.industry}</td>
              </tr>
            ))
          ) : (
            <></>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={data.length}
          paginate={paginate}
          currentPage={currentPage}
        ></Pagination>
      </div>
    </div>
  );
}

export default App;
