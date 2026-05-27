import 'package:flutter/material.dart';

void main() {
  runApp(const EconomiaComHistoriaApp());
}

class EconomiaComHistoriaApp extends StatelessWidget {
  const EconomiaComHistoriaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Economia com Historia',
      home: Scaffold(
        appBar: AppBar(title: const Text('Economia com Historia')),
        body: const Center(child: Text('Estrutura inicial pronta')),
      ),
    );
  }
}
