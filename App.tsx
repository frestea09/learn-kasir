import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { PaperProvider, Button } from "react-native-paper";
import { Camera, CameraType } from "expo-camera";
import { TextInput } from "react-native-paper";

const App = () => {
  const [barcodeData, setBarcodeData] = useState(null);
  const [productInfo, setProductInfo] = useState({
    name: "",
    price: null,
    quantity: 1,
  });
  const [hasPermission, setHasPermission] = useState(null);
  const [totalHarga, setTotalHarga] = useState(0);
  const [scannedBarcodes, setScannedBarcodes] = useState(new Set());
  const [products, setProducts] = useState([]);
  const [dataTemp, setDataTemp] = useState();
  const [listOfBuying, setListOfBuying] = useState([]);
  const [itemQuantities, setItemQuantities] = useState(0);

  const [listItem, setListItem] = useState([
    {
      idBarang: "8991002502086",
      nameBarang: "Mashi Paw",
      hargaBarang: 2000,
    },
    {
      idBarang: "8992775000250",
      nameBarang: "chocolatos",
      hargaBarang: 4000,
    },
    {
      idBarang: "8997204306590",
      nameBarang: "Bon teh Teh manis",
      hargaBarang: 2000,
    },
  ]);

  const [isWaitingForConfirmation, setIsWaitingForConfirmation] =
    useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleScan = async ({ data }) => {
    // Check if barcode is already scanned to prevent accidental scans
    if (scannedBarcodes.has(data)) {
      // Optional: Alert for accidental scan (comment out if not needed)
      // alert("Barcode sudah dipindai.");
      return;
    }

    setScannedBarcodes(scannedBarcodes.add(data)); // Use Immutable.Set method

    const matchedItem = listItem.find((item) => item.idBarang === data); // Case-sensitive comparison

    if (matchedItem) {
      const existingProductIndex = products.findIndex(
        (product) => product.id === matchedItem.id
      );
      if (existingProductIndex !== -1) {
        // Update existing product quantity if same item is scanned again
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex].quantity++;
        setProducts(updatedProducts);
        setProductInfo({
          ...matchedItem,
          quantity: products[existingProductIndex].quantity,
        });
      } else {
        // Add new product to the list if scanned for the first time
        setProducts([...products, { ...matchedItem, quantity: 1 }]);
        setProductInfo({ ...matchedItem, quantity: 1 });
      }
      // setTotalHarga(totalHarga + matchedItem.hargaBarang);
      setListOfBuying([
        ...listOfBuying,
        {
          idBarang: matchedItem.idBarang,
          nameBarang: matchedItem.nameBarang,
          harga: matchedItem.hargaBarang,
          qty: 0,
          totalBeli: 0,
        },
      ]);
    } else {
      setIsWaitingForConfirmation(true);
    }
  };
  const handleClear = () => {
    setBarcodeData(null);
    setScannedBarcodes(new Set()); // Use Immutable.Set
    setProductInfo({ name: "", price: null, quantity: 1 });
    setTotalHarga(0);
    setProducts([]);
    setListOfBuying([]);
  };

  const handleConfirmation = () => {
    setIsWaitingForConfirmation(false);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const updatedBuyingList = [...listOfBuying];
    const itemIndex = updatedBuyingList.findIndex(
      (item) => item.idBarang === itemId
    );

    if (itemIndex !== -1) {
      updatedBuyingList[itemIndex].qty = newQuantity;
      updatedBuyingList[itemIndex].totalBeli =
        newQuantity * updatedBuyingList[itemIndex].hargaBarang;
    } else {
      updatedBuyingList.push({
        ...listItem.find((item) => item.idBarang === itemId),
        qty: newQuantity,
      });
    }

    setListOfBuying(updatedBuyingList);

    const updatedProducts = products.map((product) => {
      if (product.id === itemId) {
        return { ...product, quantity: newQuantity };
      }
      return product;
    });
    setProducts(updatedProducts);

    setTotalHarga(
      products.reduce(
        (total, product) => total + product.hargaBarang * product.quantity,
        0
      )
    );
  };
  const getTotalHarga = (listOfBuying) => {
    return listOfBuying.reduce((total, item) => {
      if (item.qty > 0) {
        return total + item.harga * item.qty;
      }
      return total;
    }, 0);
  };
  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={{ width: "100%" }}>
          <Camera
            onBarCodeScanned={handleScan}
            style={styles.cameraContainer}
          />
        </View>

        <Text style={styles.text}>
          Total Harga: ${itemQuantities.toLocaleString("id-ID")}
        </Text>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 40,
          }}
        >
          <Text>Nama Barang</Text>
          <Text>Harga</Text>
          <Text>Jumlah</Text>
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {listOfBuying.map((item) => (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 40,
              }}
              key={item.idBarang}
            >
              <Text
                style={{
                  fontWeight: "bold",
                }}
              >
                {item.nameBarang}
              </Text>
              <Text>{item.harga}</Text>
              <TextInput
                value={item.qty.toString()}
                keyboardType="numeric"
                style={{
                  borderBottomEndRadius: 1,
                }}
                onChangeText={(newQuantity) =>
                  handleQuantityChange(item.idBarang, parseInt(newQuantity))
                }
              />
            </View>
          ))}
        </View>

        {isWaitingForConfirmation && (
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>
              Barcode tidak ditemukan dalam daftar.
            </Text>
            <Button onPress={handleConfirmation}> Ok</Button>
          </View>
        )}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "center",
            alignContent: "center",
            gap: 10,
          }}
        >
          <Button
            mode="contained"
            theme={{ colors: { primary: "green" } }}
            onPress={() => setItemQuantities(getTotalHarga(listOfBuying))}
          >
            Bayar
          </Button>
          <Button onPress={handleClear}>Reset</Button>
        </View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 20,
  },
  cameraContainer: {
    width: "100%",
    aspectRatio: 4 / 3, // Adjust aspect ratio as needed
  },
  text: {
    fontSize: 18,
    margin: 10,
  },
  productList: {
    marginTop: 20,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
  },
  productListItem: {
    fontSize: 16,
    margin: 5,
  },
});

export default App;
